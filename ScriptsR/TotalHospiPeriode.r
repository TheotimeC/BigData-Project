#!/usr/bin/Rscript

# UTF8

Sys.setlocale("LC_CTYPE","French")

# Appel des librairies

library(ggplot2) # permet de créer des graphiques
library(ggthemes) # permet de donner un style au graphiques

# Stockage du csv dans une variable

results <- read.csv2("D:\\A3\\BIGDATA\\ProjetCHU\\ProjetCHU\\CSVrequetes\\TotalHospitPeriode.csv", header=TRUE, sep=";")

p <- ggplot(data = results, aes(x = Date , y = Total))+ # Création du graphique
geom_point()+ # Affiche les points
geom_smooth()+ # Affiche une zone de régression
ggtitle("Taux d'hospitalisation des patients en France sur une periode de temps :")+ # Donne un titre au graphique
xlab("Date")+ # Donne un titre à l'axe des abscisses
ylab("Nombre de consultations")+ # Donne un titre à l'axe des ordonnées
theme_bw()+ # Applique le thème
theme(axis.text.x = element_text(angle=45, hjust=1))# Permet de donné un angle pour afficher les données des abscisses en diagonale

# Sauvegarde le graphique dans un fichier .png

ggsave("D:\\A3\\BIGDATA\\ProjetCHU\\ProjetCHU\\GraphsR\\TotalHospiPeriode.png")