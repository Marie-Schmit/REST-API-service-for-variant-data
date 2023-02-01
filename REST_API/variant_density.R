library(plumber)
library(ggplot2)

#* @apiTitle

#* @serializer png
#* @get /api/variants/density/plot/<genome>/<chromosome>/<windowSize>/
function(genome, chromosome, windowSize, type = "", subtype =""){
  #Define url
  url <- paste("http://localhost:3000/api/variants/density/", genome, "/", chromosome, "/", windowSize, sep = '')
  if(type != ""){ 
    #Type is given as argument
    if(type != ""){
      #Subtype is given as parameter
      url <- paste(url, "/", type, "/", subtype, sep = '')
    }
    else{ 
      #Subtype not provided, only type is a parameter
      url <- paste(url, "/", type, sep = '')
    }
  }

  print(url);
  
  #Send request
  request <- GET(url);
  response <- content(request, as = "text", encoding = "UTF-8")
  
  df <- fromJSON(response)
  print(df$Window)
  
  #Histogram
  b <- ggplot(df$Window, aes(x = StartPosition, y = Density)) +
    geom_bar(stat = "identity", fill = "steelblue") +
    ggtitle(paste("Density of variants for genome ", genome, " and chromosome ", chromosome)) +
    ylab(paste("Variant density per window of ", windowSize, " bases")) +
    xlab("Bases") 
  print(b)
}


#:genome/:chromosome/:windowSize/:type?/:subtype?