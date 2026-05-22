const DESTINATION_IMAGES = {
  "New York, USA":
    "https://i2-prod.es.themirror.com/article1791898.ece/ALTERNATES/s1200b/0_GettyImages-2259063515.jpg",
  "Manchester, Inglaterra":
    "https://wallpapercave.com/wp/wp12424111.jpg",
  "Roma, Italia":
    "https://www.atptour.com/-/media/images/news/2026/04/30/16/07/rome-2026-site-upgrade-feature-pan-angle.jpg",
  "Londres, Inglaterra":
    "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&q=80&fit=crop",
  "Ciudad de México, México":
    "https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&q=80&fit=crop",
  "Monte Carlo, Mónaco":
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&fit=crop",
  "Río de Janeiro, Brasil":
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80&fit=crop",
  "París, Francia":
    "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80&fit=crop",
  "Como, Italia":
    "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80&fit=crop",
  "Tokio, Japón":
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80&fit=crop",
  "Cusco, Perú":
    "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80&fit=crop",
  "Cancún, México":
    "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800&q=80&fit=crop",
  "Punta Arenas, Chile":
    "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80&fit=crop",
  "Santorini, Grecia":
    "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80&fit=crop",
  // Chile
  "La Serena, Chile":
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80&fit=crop",
  "Isla de Pascua, Chile":
    "https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800&q=80&fit=crop",
  "Iquique, Chile":
    "https://images.unsplash.com/photo-1531761535209-180857e963b9?w=800&q=80&fit=crop",
  "Puerto Montt, Chile":
    "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&q=80&fit=crop",
  // Argentina
  "Buenos Aires, Argentina":
    "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800&q=80&fit=crop",
  "San Carlos de Bariloche, Argentina":
    "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=800&q=80&fit=crop",
  // Italia
  "Milán, Italia":
    "https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?w=800&q=80&fit=crop",
}

// Imágenes por nombre de paquete — para cuando dos paquetes comparten destino
const PACKAGE_NAME_IMAGES = {
  "Estadio Tierra de Campeones - Iquique":
    "https://estadiosdb.com/pictures/stadiums/chi/estadio_tierra_de_campeones/estadio_tierra_de_campeones05.jpg",
  "La Bombonera - Boca Juniors en Buenos Aires":
    "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&q=80&fit=crop",
  "San Siro - AC Milan e Inter en Milán":
    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80&fit=crop",
}

const FALLBACK_GRADIENTS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
]

export const getPackageImage = (destination, packageName = "") => {
  if (packageName && PACKAGE_NAME_IMAGES[packageName]) {
    return PACKAGE_NAME_IMAGES[packageName]
  }
  return DESTINATION_IMAGES[destination] || null
}

export const getFallbackGradient = (str) => {
  const hash = (str || "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return FALLBACK_GRADIENTS[hash % FALLBACK_GRADIENTS.length]
}
