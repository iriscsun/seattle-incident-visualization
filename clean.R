library(dplyr)
library(stringr)

#read in data
raw.data <- read.csv("data/Seattle_Police_Department_911_Incident_Response.csv", stringsAsFactors = FALSE)

#select required columns from data frame
data <- raw.data %>%
  select(CAD.CDW.ID, Event.Clearance.Description, Event.Clearance.SubGroup, Event.Clearance.Group, Event.Clearance.Date,
         Hundred.Block.Location, District.Sector, Zone.Beat, Longitude, Latitude, At.Scene.Time) %>%
  filter(At.Scene.Time != "", #filter out any rows without an At.Scene.Time
         Event.Clearance.Group == "BURGLARY" | Event.Clearance.Group == "LIQUOR VIOLATIONS" | Event.Clearance.Group == "NARCOTICS COMPLAINTS"|
         Event.Clearance.Group == "ASSAULTS" | Event.Clearance.Group == "TRESPASS" | Event.Clearance.Group == "ARREST")

#split At.Scene.Time into two columns for easier conversion later
date.time <- data.frame(str_split_fixed(data$At.Scene.Time, " ", 2))
colnames(date.time) <- c("Date", "Time") #rename columns
date.time$Date <- as.Date(date.time$Date, "%m/%d/%Y") #convert to date object

clean.data <- bind_cols(date.time, data) %>% #add split date time columns to dataframe
  select(-At.Scene.Time) %>%#remove At.Scene.Time column
  filter(format(as.Date(Date), "%Y") > 2014) #grab rows after year 2014

write.csv(clean.data, "data/clean-data.csv")



d3.timeParse("%I:%M%p")("12:34pm");

# typeof(as.POSIXct("2008-04-06 10:11:01 PM", format = "%Y-%m-%d %I:%M:%S %p"))

