library(plumber)

#* @apiTitle

#* @serializer png
#* @get /api/variants/density/plot/<genome>/<chromosome>/<windowSize>/<type>/<subtype>
function(genome, chromosome, windowSize, type = "", subtype = ""){
  if(type != ""){ 
    #Type is given as argument
    if(subtype != ""){
      #Subtype is given as parameter
      request <- GET(paste("http://localhost:3000/api/variants/density/"), 
                     genome, "/", chromosome, "/", windowSize, "/", type, sep = '')
    }
    else{ 
      #Subtype not provided, only type is a parameter
      request <- GET(paste("http://localhost:3000/api/variants/density/"), 
                     genome, "/", chromosome, "/", windowSize, sep = '')
    }
  }
  else{
    #Neither type nor subtype are parameters
    request <- GET(paste("http://localhost:3000/api/variants/density/"), 
                   genome, "/", chromosome, "/", windowSize, "/", type, "/", subtype, sep = '')
  }
  
  response <- content(request, as = "text", encoding = "UTF-8")
  df <- fromJSON(response)
  print(df);
}


#:genome/:chromosome/:windowSize/:type?/:subtype?