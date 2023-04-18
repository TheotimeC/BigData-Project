#!/usr/bin/Rscript

# UTF8

Sys.setlocale("LC_CTYPE","French")

# Appel des librairies

library(ggplot2) # permet de créer des graphiques
library(ggthemes) # permet de donner un style au graphiques
library(magrittr)
library(dplyr)

# Importer les données à partir du fichier CSV
results <- read.csv2("C:\\Users\\yoann\\Documents\\DATA\\csv graph\\TotalHospiSexe.csv", header=TRUE, sep=";")

# Calculer les proportions de chaque sexe
proportions <- results %>% 
  group_by(Sexe) %>% 
  summarise(Total = sum(Total)) %>% 
  mutate(Proportion = Total / sum(Total))

# Tracer le camembert
camembert <- ggplot(proportions, aes(x = "", y = Proportion, fill = Sexe)) +
  geom_bar(width = 1, stat = "identity", position = "fill") +
  geom_text(aes(label = scales::percent(Proportion)), position = position_fill(vjust = 0.5)) +
  coord_polar(theta = "y") +
  labs(title = "Répartition des hospitalisations par sexe",
       fill = "Sexe",
       x = NULL,
       y = NULL) +
  theme_void() +
  theme(legend.position = "bottom")

# Afficher le camembert
ggsave("C:\\Users\\yoann\\Documents\\DATA\\csv graph\\TotalHospiSexeCamembert.png")