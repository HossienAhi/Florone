import { getToppingTopicImage } from '../../data/toppingAssets';

/**
 * نمایش آیکن تاپینگ: تصویر topic اگر موجود باشد، وگرنه ایموجی
 */
export default function ToppingVisual({
  topping,
  className = '',
  imgClassName = '',
  emojiClassName = '',
}) {
  const id = typeof topping === 'string' ? topping : topping?.id;
  const emoji = typeof topping === 'string' ? null : topping?.emoji;
  const src = getToppingTopicImage(id);

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={imgClassName || className}
        draggable={false}
        aria-hidden="true"
      />
    );
  }

  return (
    <span className={emojiClassName || className} aria-hidden="true">
      {emoji ?? '🍕'}
    </span>
  );
}
