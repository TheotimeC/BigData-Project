#!/usr/bin/Rscript

# UTF8

Sys.setlocale("LC_CTYPE","French")

# Appel des librairies

library(ggplot2) # permet de créer des graphiques
library(ggthemes) # permet de donner un style au graphiques

# Importer les données à partir du fichier CSV
results <- read.csv2("C:\\Users\\yoann\\Documents\\DATA\\csv graph\\TotalHospiSexe.csv", header=TRUE, sep=";")

# Tracer l'histogramme
histogramme <- ggplot(data = results, aes(x = Sexe, y = Total, fill = Sexe)) +
geom_bar(stat = "identity", position = "dodge", alpha = 0.5) +
geom_text(aes(label = Total), vjust = -0.5) +
labs(title = "Nombre d'hospitalisations par sexe",
y = "Nombre d'hospitalisations") +
theme_bw() +
theme(plot.title = element_text(hjust = 0.5),
    axis.title.x = element_blank(),
    axis.text.x = element_blank(),
    axis.ticks.x = element_blank())

# Afficher l'histogramme
ggsave("C:\\Users\\yoann\\Documents\\DATA\\csv graph\\TotalHospiSexe.png")