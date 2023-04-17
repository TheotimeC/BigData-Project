#!/usr/bin/Rscript

# Appel des librairies

library(ggplot2) # permet de créer des graphiques
library(ggthemes) # permet de donner un style au graphiques
library(magrittr)
library(dplyr)

# Importer les données à partir du fichier CSV
results <- read.csv2("C:\\Users\\yoann\\Documents\\DATA\\csv graph\\TotalHospiAge.csv", header=TRUE, sep=";")

results$Age_Group <- cut(results$Age, breaks = seq(0, 110, by = 10), right = FALSE)

# Calculer les proportions de chaque age
proportions <- results %>% 
  group_by(Age_Group) %>% 
  summarise(Total = sum(Total)) %>% 
  mutate(Proportion = Total / sum(Total))

# Tracer le camembert
camembert <- ggplot(proportions, aes(x = "", y = Proportion, fill = Age_Group)) +
  geom_bar(width = 1, stat = "identity", position = "fill") +
  geom_text(aes(label = scales::percent(Proportion)), position = position_fill(vjust = 0.5)) +
  coord_polar(theta = "y") +
  labs(title = "Repartition des hospitalisations par tranche d'Age",
       fill = "Tranche d'Age",
       x = NULL,
       y = NULL) +
  theme_void() +
  theme(legend.position = "bottom",
        plot.title = element_text(hjust = 0.5))
# Ajout du code pour afficher les informations lorsqu'on survole les parts du camembert
# geom_label(aes(label = paste(Age_Group, scales::percent(Proportion))), 
#          position = position_stack(vjust = 0.5), show.legend = FALSE, 
# label.padding = unit(0.2, "lines"), size = 3, fill = "white", 
# fontface = "bold", label.r = unit(0.2, "lines"))

# Afficher le camembert
print(camembert)
ggsave("C:\\Users\\yoann\\Documents\\DATA\\csv graph\\TotalHospiAgeCamembert.png")