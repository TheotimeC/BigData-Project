#!/usr/bin/Rscript

# UTF8

Sys.setlocale("LC_CTYPE","French")

# Appel des librairies

library(ggplot2) # permet de créer des graphiques
library(ggthemes) # permet de donner un style au graphiques

# Stockage du csv dans une variable

results <- read.csv2("C:\\Users\\yoann\\Documents\\DATA\\csv graph\\TotalConsultPeriode.csv", header=TRUE, sep=";")

p <- ggplot(data = results, aes(x = Date , y = Total))+ # Création du graphique
geom_point()+ # Affiche les points
geom_smooth()+ # Affiche une zone de régression
ggtitle("Taux de consultation des patients en France sur une periode de temps :")+ # Donne un titre au graphique
xlab("Date du jour")+ # Donne un titre à l'axe des abscisses
ylab("Nombre de consultations")+ # Donne un titre à l'axe des ordonnées
theme_bw()+ # Applique le thème
theme(axis.text.x = element_text(angle=45, hjust=1))# Permet de donné un angle pour afficher les données des abscisses en diagonale

# Sauvegarde le graphique dans un fichier .png

ggsave("C:\\Users\\yoann\\Documents\\DATA\\csv graph\\TotalConsultPeriode.png")