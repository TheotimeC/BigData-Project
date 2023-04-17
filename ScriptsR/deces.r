# Chargement du fichier CSV
data <- read.csv("fichier.csv")

# Chargement des packages nécessaires
library(ggplot2)
library(maps)
library(mapdata)
library(geosphere)

# Tracer la carte du monde
world_map <- ggplot() + 
  borders("world", colour="gray50", fill="white") +
  coord_map() +
  theme_void()

# Ajouter les cercles avec le nombre de morts et le nom de la ville
world_map +
  geom_point(data = data, aes(x = lon, y = lat, size = nb_morts, fill = nb_morts), shape = 21) +
  scale_size_continuous(range = c(1, 20)) +
  scale_fill_gradient(low = "white", high = "red") +
  geom_text(data = data, aes(x = lon, y = lat, label = ville), size = 3, hjust = 0.5, vjust = 0.5)