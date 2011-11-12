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
    {:col => 43, :theme => 5, :func  => 'select_negative'},
    {:col => 44, :theme => 4, :func  => 'select_negative'},
    {:col => 45, :theme => 4, :func  => 'select_negative'},
    {:col => 46, :theme => 4, :func  => 'select_negative'},
    {:col => 47, :theme => 4, :func  => 'select_negative'},
    {:col => 48, :theme => 4, :func  => 'select_negative'},
    {:col => 49, :theme => 5, :func  => 'select_negative'},
    {:col => 50, :theme => 4, :func  => 'select_negative'},
    {:col => 51, :theme => 4, :func  => 'select_negative'},
    {:col => 52, :theme => 4, :func  => 'select_negative'},
    {:col => 53, :theme => 3, :func  => 'select_negative'},
    {:col => 54, :theme => 5, :func  => 'select_negative'},
    {:col => 55, :theme => 5, :func  => 'select_negative'},
    {:col => 56, :theme => 4, :func  => 'select_negative'},
    {:col => 57, :theme => 0, :func  => 'select_negative'}, #NOTA

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
    {:col => 70, :theme => 0, :func  => 'select_negative'}, #NOTA

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
    {:col => 86, :theme => 0, :func  => 'select_positive'}, #NOTA

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
    return Participant.new(themes, row[3].downcase == 'male' ? 1 : 0, row[4])
  end
end

class Participant
  attr_accessor :gender, :age, :themes

  def initialize(themes, gender, age)
    @themes = themes
    @gender = gender
    @age = age
  end

  def average_for_theme(theme_no)
    return @themes[theme_no].mean
  end

  def average_for_themes
    return (1..5).map{ |i| average_for_theme(i)}
  end

  def polarity_for_theme(theme_no)
    t_avg = average_for_theme theme_no
    if t_avg < 0.4
      return -1
    elsif t_avg < 0.6
      return 0
    else
      return 1
    end
  end

  def inspect
    {:age => @age, :gender => @gender == 1 ? 'M' : 'F', :theme_averages => average_for_themes}
  end
end

class Population
  attr_accessor :participants

  def initialize(p = [])
    @participants = p
  end

  def filter_gender(gender)
    return Population.new(@participants.dup.delete_if {|p| p.gender != gender})
  end

  def filter_age(min = 18, max = 100)
    return Population.new(@participants.dup.delete_if {|p| p.age < min || p.age > max})
  end

  def filter_agegroup(agegroup)
    case agegroup
    when 'young'
      return filter_age(18, 29)
    when 'mature'
      return filter_age(30, 49)
    when 'older'
      return filter_age(50, 65)
    when 'elderly'
      return filter_age(66)
    end
  end
  
  def polarity_count_for_theme(theme_no, pol)
    return (@participants.dup.delete_if {|p| p.polarity_for_theme(theme_no) != pol}).length
  end
  
  def polarity_count_for_themes
    return (1..5).map{ |i| polarity_count_for_theme(i)}
  end

  def polarity_counts_for_theme(theme_no)
    return [1,0,-1].map{ |pol| (@participants.dup.delete_if {|p| p.polarity_for_theme(theme_no) != pol}).length}
  end
  
  def polarity_counts_for_themes
    return (1..5).map{ |i| polarity_counts_for_theme(i)}
  end
end

#CODE



# puts participants.inspect
# puts participants[0].average_for_theme(1)
p = Population.new
CSV.foreach("OlympicFutures_UK_Raw.csv", :quote_char => '"', :col_sep =>',', :row_sep =>:auto) do |row|
  p.participants << CSVEvaluator.eval_row(row)
  # break                            
end


# puts "#{p.participants.length} Participants"
# p.participants.each do |participant|
#   # puts participant.inspect
# end
# 
# men = p.filter_gender(1).participants
# puts "#{men.length} Male Participants"
# men.each do |participant|
#   # puts participant.inspect
# end
# 
# women = p.filter_gender(0).participants
# puts "#{women.length} Female Participants"
# women.each do |participant|
#   # puts participant.inspect
# end

def json_row(tn, v)
  
end



# puts p.polarity_count_for_themes.inspect
themes = ["personal","environment", "general","technology","legacy"]
bigassjson = themes.each_with_index.map { |theme, theme_no|
  {
    :theme_name => theme
    :data => {
      :pos => 
      :neg => 
      :neu =>
    }
  }
  # [1,0,-1].map{ |valence|
  #     p.polarity_count_for_theme(theme_no, valence)
  #   }
}

ap JSON.generate({:dataset => bigassjson})



