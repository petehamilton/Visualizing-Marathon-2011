require 'csv'
require 'json'
require 'ap'

#Additional Array Functions
class Array
  def sum
    inject(0.0) { |result, el| result + el }
  end

  def mean 
    sum / size
  end
end


class CSVEvaluator
  @col_eval_instrs = [
    #FP5
    {:col => 39, :theme => 2, :func =>  'agree_negative'},
    {:col => 40, :theme => 5, :func  => 'agree_negative'},
    {:col => 41, :theme => 5, :func  => 'agree_negative'},
    {:col => 42, :theme => 2, :func  => 'agree_negative'},

    #FP6
    {:col => 43, :theme => 5, :func  => 'select_positive'},
    {:col => 44, :theme => 4, :func  => 'select_positive'},
    {:col => 45, :theme => 4, :func  => 'select_positive'},
    {:col => 46, :theme => 4, :func  => 'select_positive'},
    {:col => 47, :theme => 4, :func  => 'select_positive'},
    {:col => 48, :theme => 4, :func  => 'select_positive'},
    {:col => 49, :theme => 5, :func  => 'select_positive'},
    {:col => 50, :theme => 4, :func  => 'select_positive'},
    {:col => 51, :theme => 4, :func  => 'select_positive'},
    {:col => 52, :theme => 4, :func  => 'select_positive'},
    {:col => 53, :theme => 3, :func  => 'select_positive'},
    {:col => 54, :theme => 5, :func  => 'select_positive'},
    {:col => 55, :theme => 5, :func  => 'select_positive'},
    {:col => 56, :theme => 4, :func  => 'select_positive'},
    # {:col => 57, :theme => 0, :func  => 'select_positive'}, #NOTA

    #FP7
    {:col => 58, :theme => 1, :func  => 'select_negative'},
    {:col => 59, :theme => 5, :func  => 'select_negative'},
    {:col => 60, :theme => 5, :func  => 'select_negative'},
    {:col => 61, :theme => 5, :func  => 'select_negative'},
    {:col => 62, :theme => 1, :func  => 'select_negative'},
    {:col => 63, :theme => 4, :func  => 'select_negative'},
    {:col => 64, :theme => 5, :func  => 'select_negative'},
    {:col => 65, :theme => 5, :func  => 'select_negative'},
    {:col => 66, :theme => 5, :func  => 'select_negative'},
    {:col => 67, :theme => 4, :func  => 'select_negative'},
    {:col => 68, :theme => 4, :func  => 'select_negative'},
    {:col => 69, :theme => 1, :func  => 'select_negative'},
    # {:col => 70, :theme => 0, :func  => 'select_negative'}, #NOTA

    #FP8
    {:col => 71, :theme => 1, :func  => 'yes_no_positive'},

    #FP9
    {:col => 72, :theme => 3, :func  => 'select_negative'},
    {:col => 73, :theme => 3, :func  => 'select_positive'},
    {:col => 74, :theme => 3, :func  => 'select_positive'},
    {:col => 75, :theme => 3, :func  => 'select_negative'},
    {:col => 76, :theme => 3, :func  => 'select_positive'},
    {:col => 77, :theme => 3, :func  => 'select_negative'},
    {:col => 78, :theme => 3, :func  => 'select_positive'},
    {:col => 79, :theme => 3, :func  => 'select_negative'},
    {:col => 80, :theme => 3, :func  => 'select_positive'},
    {:col => 81, :theme => 3, :func  => 'select_negative'},
    {:col => 82, :theme => 3, :func  => 'select_positive'},
    {:col => 83, :theme => 3, :func  => 'select_positive'},
    {:col => 84, :theme => 3, :func  => 'select_negative'},
    {:col => 85, :theme => 3, :func  => 'select_positive'},
    # {:col => 86, :theme => 0, :func  => 'select_positive'}, #NOTA

    #FP10
    {:col => 87, :theme => 3, :func  => 'agree_positive'},
    {:col => 88, :theme => 3, :func  => 'agree_positive'},
    {:col => 90, :theme => 3, :func  => 'agree_positive'},

    #FP12
    {:col => 100, :theme => 5, :func  => 'agree_positive'},
    {:col => 102, :theme => 4, :func  => 'agree_positive'},
    {:col => 103, :theme => 2, :func  => 'agree_positive'},

    #L2                                  
    {:col => 103, :theme => 2, :func  => 'agree_positive'},
  ]

  def self.agree_positive(answer)
    case answer.downcase
    when "agree strongly"
      return 1
    when "agree slightly"
      return 0.75
    when "disagree slightly"
      return 0.25
    when "disagree strongly"
      return 0
    end
  end

  def self.agree_negative(answer)
    case answer.downcase
    when "agree strongly"
      return 0
    when "agree slightly"
      return 0.25
    when "disagree slightly"
      return 0.75
    when "disagree strongly"
      return 0
    end
  end

  def self.select_positive(answer)
    case answer.downcase
    when "selected"
      return 1
    else
      return 0
    end
  end

  def self.select_negative(answer)
    case answer.downcase
    when "selected"
      return 0
    else
      return 1
    end
  end

  def self.yes_no_positive(answer)
    case answer.downcase
    when "yes"
      return 1
    else
      return 0
    end
  end

  def self.yes_no_negative(answer)
    case answer.downcase
    when "yes"
      return 0
    else
      return 1
    end
  end

  def self.eval_row(row)
    themes = [[],[],[],[],[],[]]
    @col_eval_instrs.each do |rule|
      expr = "self.#{rule[:func]} '#{row[rule[:col]]}'"
      result = eval expr
      themes[rule[:theme]] << result
    end
    return Participant.new(themes, row[3].downcase == 'male' ? 1 : 0, row[4].to_i, row[1].downcase == 'london' ? 1 : 0)
  end
end

class Participant
  attr_accessor :gender, :age, :themes, :londoner

  def initialize(themes, gender, age, londoner)
    @themes = themes
    @gender = gender.to_i
    @age = age.to_i
    @londoner = londoner.to_i
  end

  def average_for_theme(theme_no)
    return @themes[theme_no].mean
  end

  def polarity_for_theme(theme_no)
    t_avg = average_for_theme theme_no
    if t_avg < 0.4
      return 0
    elsif t_avg < 0.6
      return 1
    else
      return 2
    end
  end

  def inspect
    {:age => @age, :gender => @gender == 1 ? 'M' : 'F', :londoner => @londoner, :theme_averages => average_for_themes}
  end
end

class Population
  attr_accessor :participants

  def initialize(p = [])
    @participants = p
  end

  def filter_gender(gender = nil)
    return Population.new(@participants.dup.delete_if {|p| p.gender != gender && gender != nil})
  end

  def filter_age(min = 18, max = 100)
    return Population.new(@participants.dup.delete_if {|p| p.age < min || p.age > max})
  end
  
  def filter_londoner(londoner = nil)
    return Population.new(@participants.dup.delete_if {|p| p.londoner != londoner && londoner != nil})
  end

  def filter_agegroup(agegroup = nil)
    case agegroup
    when 'young'
      return filter_age(18, 29)
    when 'mature'
      return filter_age(30, 49)
    when 'older'
      return filter_age(50, 65)
    when 'elderly'
      return filter_age(66)
    else
      return Population.new(@participants.dup)
    end
  end
  
  def check_linkage(t1n,t1v,t2n,t2v,p)
    result = !(p.polarity_for_theme(t1n) == t1v && p.polarity_for_theme(t2n) == t2v)
    
    puts "Polarity t#{t1n}(#{t1v}): #{p.polarity_for_theme(t1n)}, Polarity t#{t2n}(#{t2v}): #{p.polarity_for_theme(t2n)}, Result: #{result}"
    
    if t1n == t2n
      print "Same theme"
      if t1v == t2v
        puts " and Same Valency"
        puts result
      else
        puts " #{result}";
      end
    end
    puts
  end
  
  
  def linkage_matrix_entry(t1n,t1v,t2n,t2v)
    # return 0 if t1n == t2n
    # return (@participants.dup.delete_if {|p| p.polarity_for_theme(t1n) != t1v && p.polarity_for_theme(t2n) != t2v}).length
    return (@participants.dup.delete_if {|p| !(p.polarity_for_theme(t1n) == t1v && p.polarity_for_theme(t2n) == t2v) }).length
  end

  def full_linkage_matrix
    matrix = []
    15.times{matrix << []}

    row = 0
    [4,5,2,3,1].each do |t1n|
      [0, 1, 2].each do |t1v|
        
        [4,5,2,3,1].each do |t2n|
          [0, 1, 2].each do |t2v|
            matrix[row] << linkage_matrix_entry(t1n,t1v,t2n,t2v)
          end
        end
        row += 1
      end
    end
    return matrix
  end
end

#Func to get link matrix json
def matrixjson(p)
  json_obj = {}
  [nil, 1, 0].each do |lr|
    if lr.nil?
      lr_t = 'both'
    elsif lr == 1
      lr_t = 'londoner'
    else
      lr_t = 'elsewhere'
    end
    
    [nil, "young", "mature", "older", "elderly"].each do |ag|
      if ag.nil?
        ag_t = 'all'
      else
        ag_t = ag
      end

      [nil, 1, 0].each do |g|
        if g.nil?
          g_t = 'both'
        elsif g == 1
          g_t = 'male'
        else
          g_t = 'female'
        end
        json_obj["#{g_t}_#{ag_t}_#{lr_t}"] = p.filter_gender(g).filter_agegroup(ag).filter_londoner(lr).full_linkage_matrix
      end
    end
  end
  return json_obj
end

p = Population.new

index = 0
CSV.foreach("OlympicFutures_UK_Raw.csv", :quote_char => '"', :col_sep =>',', :row_sep =>:auto) do |row|
  p.participants << CSVEvaluator.eval_row(row)
  # index += 1
  # break if index == 10
end

#Output Matrix data as json
def output_matrices(p)
  m = matrixjson(p)
  m.each do |d|
    puts d[0]
    d[1].each do |mr|
      mr.each do |c|
        print "#{c}#{c.to_s == " " || c < 10 ? ' ' : ''} "
      end
      puts
    end
    puts
  end
end

puts p.participants.length
output_matrices(p)

# puts JSON.generate({:dataset => stdjson(p)})
puts JSON.generate({:dataset => matrixjson(p)})



