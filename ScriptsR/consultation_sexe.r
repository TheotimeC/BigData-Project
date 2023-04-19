library(ggplot2)
library(ggthemes)
library(dplyr)


data <- read.csv("C:\\Users\\romai\\WebstormProjects\\ProjetCHU\\CSVrequetes\\TotalConsultSexe.csv", sep=";")

data$AgeGroup <- cut(data$Age, seq(0, 111, by=10), right = FALSE)

data %>%

  group_by(AgeGroup) %>%
  summarize(PercentHosp = sum(Total)/sum(data$Total) * 100) %>%
    ggplot(aes(x=AgeGroup, y=PercentHosp, tooltip = paste0(sprintf("%.2f", PercentHosp), "%")))+
    geom_bar(stat= "identity", fill="steelblue") +
    labs(title = "Taux d'hospitalisation par sexe",
       x = "Sexe",
       y = "Pourcentage") +
    theme(axis.text.x = element_text(angle = 45, vjust = 1, hjust=1))


ggsave("A:/Data/Total_Hospi_Sexe.png", width=10, height=5)



