/** تصاویر تاپینگ — public/topic (هم‌نام با dist/topic) */
export const TOPPING_TOPIC_IMAGES = {
  'ground-beef': '/topic/minced-meat.png',
  steak: '/topic/steak.png',
  pepperoni: '/topic/pepperoni.png',
  bacon: '/topic/bacon.png',
  'curry-chicken': '/topic/chicken-curry.png',
  'plain-chicken': '/topic/chicken-shredded.png',
  mushroom: '/topic/mushroom.png',
  onion: '/topic/onions.png',
  jalapeno: '/topic/chili.png',
};

export function getToppingTopicImage(toppingId) {
  if (!toppingId) return null;
  return TOPPING_TOPIC_IMAGES[toppingId] ?? null;
}

export function hasToppingTopicImage(toppingId) {
  return Boolean(getToppingTopicImage(toppingId));
}
