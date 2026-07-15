// src/data/menuData.js
// تمام داده‌های منو در یک فایل

export const menuCategories = [
  { id: 'stack',    name: 'استیک',       icon: '/icons/stack.png',    path: '/menu/stack'    },
  { id: 'sokhari',  name: 'سوخاری',      icon: '/icons/sokhari.png',  path: '/menu/sokhari'  },
  { id: 'pizza',    name: 'پیتزا',       icon: '/icons/pizza.png',    path: '/menu/pizza'    },
  { id: 'pasta',    name: 'پاستا',       icon: '/icons/pasta.png',    path: '/menu/pasta'    },
  { id: 'burger',   name: 'برگر',        icon: '/icons/burger.png',   path: '/menu/burger'   },
  { id: 'sandwich', name: 'ساندویچ‌ها',  icon: '/icons/sandwich.png', path: '/menu/sandwich' },
  { id: 'salad',    name: 'سالادها',     icon: '/icons/salads.png',   path: '/menu/salad'    },
  { id: 'starter',  name: 'پیش‌غذا',     icon: '/icons/starter.png',  path: '/menu/starter'  },
  { id: 'mocktail', name: 'ماکتیل',      icon: '/icons/mocktail.png', path: '/menu/mocktail' },
  { id: 'shake',    name: 'شیک',         icon: '/icons/shake.png',    path: '/menu/shake'    },
  { id: 'smoti',    name: 'اسموتی',      icon: '/icons/smoti.png',    path: '/menu/smoti'    },
  { id: 'drinks',   name: 'نوشیدنی‌ها',  icon: '/icons/drinks.png',   path: '/menu/drinks'   },
  { id: 'tea',      name: 'چای و دمنوش', icon: '/icons/tea.png',      path: '/menu/tea'      },
  /* gridName: اسمی که در گرید دسته‌بندی‌های صفحه /menu نشان داده می‌شود */
  { id: 'espresso', name: 'اسپرسو بار سرد', gridName: 'نوشیدنی پایه اسپرسو', icon: '/icons/espresso.png', path: '/menu/espresso' },
  /* navOnly: فقط در نوار افقیِ صفحه‌ی دسته‌بندی نمایش داده می‌شود، نه در گرید /menu */
  { id: 'espresso-hot', name: 'اسپرسو بار گرم', icon: '/icons/espresso.png', path: '/menu/espresso-hot', navOnly: true },
  { id: 'milk-based', name: 'پایه شیر گرم', icon: '/icons/milk-based.png', path: '/menu/milk-based' },
  { id: 'hookah',   name: 'قلیون',       icon: '/icons/hookah.png',   path: '/menu/hookah'   },
];

export const menuItems = {
  pizza: {
    title: 'پیتزا',
    items: [
      { id: 1, name: 'Pepperoni Feast',   nameFA: 'پپرونی فیست',    price: '۶۵۰,۰۰۰', discount: 15, featuredFloravan: true, desc: 'پپرونی، پارمازان، پنیر ذوب‌شده و سس مخصوص',           image: '/src/assets/menu/pizza-pepperoni.jpg' },
      { id: 2, name: 'Truffle Mushroom',  nameFA: 'ترافل قارچ',     price: '۷۲۰,۰۰۰', desc: 'قارچ تازه، روغن ترافل، پنیر موزارلا و سبزیجات معطر',  image: '/src/assets/menu/pizza-truffle.jpg'    },
      { id: 3, name: 'Chicken Special',   nameFA: 'مرغ ویژه',       price: '۷۸۰,۰۰۰', desc: 'فیله مرغ، پنیر چدار، قارچ و سس باربیکیو خانگی',       image: '/src/assets/menu/pizza-chicken.jpg'    },
      { id: 4, name: 'Dancery Pizza',     nameFA: 'دنسری',          price: '۷۲۰,۰۰۰', featuredFloravan: true, desc: 'گوجه، پپرونی، پنیر، قارچ و کرم ذرت ویژه فلوروان',    image: '/src/assets/menu/pizza-dancery.jpg'    },
      { id: 5, name: 'Special Pizza',     nameFA: 'پیتزا اسپشیال',  price: '۶۳۰,۰۰۰', desc: 'ترکیب ویژه پنیرهای ایتالیایی با سس گوجه تازه',        image: '/src/assets/menu/pizza-special.jpg'    },
      { id: 6, name: 'Delicious Veggie',  nameFA: 'سبزیجات لذیذ',  price: '۷۲۰,۰۰۰', desc: 'گوجه، ریحان، کدو، فلفل رنگی و پنیر موزارلا تازه',    image: '/src/assets/menu/pizza-veggie.jpg'     },
    ],
  },
  burger: {
    title: 'برگر',
    items: [
      {
        id: 1,
        name: 'Classic Burger',
        nameFA: 'برگر کلاسیک',
        price: '۳۹۵,۰۰۰',
        discount: 10,
        featuredFloravan: true,
        desc: 'گوشت ۱۸۰ گرمی، پنیر چدار، خیارشور و سس مخصوص همراه با سیب‌زمینی سرخ‌شده و سس تارتار',
        image: '/src/assets/pictures/burger.png',
        optionGroups: [
          {
            id: 'g-extras',
            name: 'جزئیات محصول',
            type: 'multiple',
            required: false,
            choices: [
              { id: 'c-onion',    label: 'پیاز گریل شده', priceDelta: '۱۵,۰۰۰' },
              { id: 'c-mushroom', label: 'قارچ و پنیر',   priceDelta: '۴۵,۰۰۰' },
            ],
          },
          {
            id: 'g-sauce',
            name: 'انتخاب سس',
            type: 'single',
            required: true,
            choices: [
              { id: 's-tartar', label: 'سس تارتار',   priceDelta: '' },
              { id: 's-special', label: 'سس مخصوص',   priceDelta: '' },
              { id: 's-bbq',     label: 'سس باربیکیو', priceDelta: '۱۰,۰۰۰' },
            ],
          },
        ],
      },
      { id: 2, name: 'Double Smash',      nameFA: 'دابل اسمش',      price: '۵۵۰,۰۰۰', discount: 20, desc: 'دو پتی اسمش‌برگر، پنیر آمریکن، کاراملی‌شده',          image: '/src/assets/pictures/burger.png'       },
      { id: 3, name: 'Mushroom Swiss',    nameFA: 'قارچ و سوئیس',   price: '۴۸۰,۰۰۰', desc: 'قارچ تفت‌داده‌شده، پنیر سوئیس، سس تارتار',            image: '/src/assets/pictures/burger.png'       },
      { id: 4, name: 'Crispy Chicken',    nameFA: 'مرغ کریسپی',     price: '۴۲۰,۰۰۰', desc: 'فیله مرغ سوخاری، کاهو تازه، سس هانی موستارد',        image: '/src/assets/pictures/burger.png'       },
    ],
  },
  stack: {
    title: 'استیک',
    items: [
      { id: 1, name: 'Ribeye Steak',      nameFA: 'ریبای استیک',    price: '۱,۲۵۰,۰۰۰', desc: 'استیک ریبای ۲۵۰ گرمی گریل‌شده با کره و رزماری',      image: '/src/assets/pictures/steak.jpg'        },
      { id: 2, name: 'Filet Mignon',      nameFA: 'فیله میگنون',    price: '۱,۴۵۰,۰۰۰', desc: 'لطیف‌ترین برش فیله، پخته با دقت و سس پپر',            image: '/src/assets/pictures/steak.jpg'        },
      { id: 3, name: 'Sirloin Classic',   nameFA: 'سیرلوین کلاسیک', price: '۹۸۰,۰۰۰',   desc: 'استیک ۲۲۰ گرمی سیرلوین با سیب‌زمینی ماهیتابه‌ای',   image: '/src/assets/pictures/steak.jpg'        },
    ],
  },
  pasta: {
    title: 'پاستا',
    items: [
      { id: 1, name: 'Alfredo Pasta',     nameFA: 'پاستا آلفردو',   price: '۳۸۵,۰۰۰', desc: 'پاستا فتوچینی با سس خامه آلفردو و پارمازان',          image: '/src/assets/pictures/pasta.png'        },
      { id: 2, name: 'Bolognese',         nameFA: 'بولونیز',         price: '۴۲۰,۰۰۰', desc: 'پاستا اسپاگتی با سس گوشت و گوجه تازه ایتالیایی',     image: '/src/assets/pictures/pasta.png'        },
      { id: 3, name: 'Carbonara',         nameFA: 'کاربونارا',       price: '۴۵۰,۰۰۰', desc: 'پنه با سس خامه، بیکن و پارمازان رنده‌شده',            image: '/src/assets/pictures/pasta.png'        },
    ],
  },
  sandwich: {
    title: 'ساندویچ‌ها',
    items: [],
  },
  salad: {
    title: 'سالادها',
    items: [],
  },
  starter: {
    title: 'پیش‌غذا',
    items: [
      { id: 1, name: 'Caesar Salad',      nameFA: 'سالاد سزار',      price: '۲۸۵,۰۰۰', desc: 'کاهو رومن، کروتون، پارمازان و سس سزار اصیل',         image: '/src/assets/pictures/salad.jpg'        },
      { id: 2, name: 'Bruschetta',        nameFA: 'بروسکتا',         price: '۲۴۰,۰۰۰', desc: 'نان ترد با گوجه تازه، ریحان و روغن زیتون اضافه',     image: '/src/assets/pictures/salad.jpg'        },
      { id: 3, name: 'Soup of the Day',   nameFA: 'سوپ روز',         price: '۱۹۵,۰۰۰', desc: 'سوپ روزانه شف با نان تازه فلوروان',                  image: '/src/assets/pictures/salad.jpg'        },
    ],
  },
  sokhari: {
    title: 'سوخاری',
    items: [
      { id: 1, name: 'Crispy Wings',      nameFA: 'بال سوخاری',      price: '۳۴۵,۰۰۰', desc: 'بال مرغ سوخاری با سس باربیکیو یا هات',               image: '/src/assets/pictures/steak.jpg'        },
      { id: 2, name: 'Chicken Strips',    nameFA: 'استریپس مرغ',     price: '۳۲۰,۰۰۰', desc: 'فیله مرغ سوخاری با سس هانی موستارد',                 image: '/src/assets/pictures/steak.jpg'        },
    ],
  },
  mocktail: {
    title: 'ماکتیل',
    items: [
      { id: 1, name: 'Mango Sunset',      nameFA: 'غروب انبه',       price: '۱۸۵,۰۰۰', desc: 'انبه، آب لیمو، سودا و شربت گل‌محمدی',                image: '/src/assets/pictures/salad.jpg'        },
      { id: 2, name: 'Blue Ocean',        nameFA: 'اقیانوس آبی',     price: '۱۹۵,۰۰۰', desc: 'آب‌انگور، پرتقال، سودا و سیروپ آبی',                 image: '/src/assets/pictures/salad.jpg'        },
    ],
  },
  shake: {
    title: 'شیک',
    items: [
      { id: 1, name: 'Chocolate Shake',   nameFA: 'شیک شکلات',       price: '۱۶۵,۰۰۰', desc: 'شیر، بستنی شکلات و پودر کاکائو بلژیکی',              image: '/src/assets/pictures/salad.jpg'        },
      { id: 2, name: 'Strawberry Shake',  nameFA: 'شیک توت‌فرنگی',   price: '۱۶۵,۰۰۰', desc: 'شیر، بستنی وانیل و توت‌فرنگی تازه',                  image: '/src/assets/pictures/salad.jpg'        },
    ],
  },
  smoti: {
    title: 'اسموتی',
    items: [
      { id: 1, name: 'Green Power',       nameFA: 'قدرت سبز',        price: '۱۸۵,۰۰۰', desc: 'اسفناج، آووکادو، موز، شیر بادام و عسل',              image: '/src/assets/pictures/salad.jpg'        },
      { id: 2, name: 'Berry Blast',       nameFA: 'انفجار توت',      price: '۱۹۵,۰۰۰', desc: 'بلوبری، تمشک، ماست یونانی و شهد آگاو',               image: '/src/assets/pictures/salad.jpg'        },
    ],
  },
  drinks: {
    title: 'نوشیدنی‌ها',
    items: [],
  },
  tea: {
    title: 'چای و دمنوش',
    items: [
      { id: 1, name: 'Persian Earl Grey', nameFA: 'ارل گری ایرانی',  price: '۹۵,۰۰۰',  desc: 'چای ارل گری با طعم‌دهنده گل‌محمدی و هل',              image: '/src/assets/pictures/salad.jpg'        },
      { id: 2, name: 'Herbal Blend',      nameFA: 'دمنوش گیاهی',     price: '۸۵,۰۰۰',  desc: 'مخلوط آرام‌بخش بابونه، لاوندر و نعناع',              image: '/src/assets/pictures/salad.jpg'        },
    ],
  },
  espresso: {
    title: 'اسپرسو بار سرد',
    items: [
      { id: 1, name: 'Double Espresso',   nameFA: 'دابل اسپرسو',     price: '۱۲۵,۰۰۰', desc: 'دو شات اسپرسو تازه‌دم با دانه‌های برزیلی اعلا',      image: '/src/assets/pictures/salad.jpg'        },
      { id: 2, name: 'Flat White',        nameFA: 'فلت وایت',        price: '۱۴۵,۰۰۰', desc: 'دو شات ریسترتو با شیر بخاردیده ابری',                image: '/src/assets/pictures/salad.jpg'        },
      { id: 3, name: 'Cappuccino',        nameFA: 'کاپوچینو',        price: '۱۳۵,۰۰۰', desc: 'اسپرسو، شیر بخار و فوم شیر کامل',                   image: '/src/assets/pictures/salad.jpg'        },
    ],
  },
  'espresso-hot': {
    title: 'اسپرسو بار گرم',
    items: [
      { id: 1, name: 'Americano',         nameFA: 'آمریکانو',        price: '۱۱۵,۰۰۰', desc: 'اسپرسو با آب جوش، طعم قهوه در خالص‌ترین حالت',       image: '/src/assets/pictures/salad.jpg'        },
      { id: 2, name: 'Caffe Latte',       nameFA: 'کافه لاته',       price: '۱۴۵,۰۰۰', desc: 'اسپرسو با شیر بخاردیده و لایه‌ای لطیف از فوم',       image: '/src/assets/pictures/salad.jpg'        },
      { id: 3, name: 'Caffe Mocha',       nameFA: 'کافه موکا',       price: '۱۵۵,۰۰۰', desc: 'اسپرسو، شکلات بلژیکی و شیر بخاردیده',                image: '/src/assets/pictures/salad.jpg'        },
    ],
  },
  'milk-based': {
    title: 'پایه شیر گرم',
    items: [],
  },
  hookah: {
    title: 'قلیون',
    items: [
      { id: 1, name: 'Double Apple',      nameFA: 'سیب دوبل',        price: '۴۵۰,۰۰۰', desc: 'ترکیب سیب سبز و قرمز با یخ فلوروان',                 image: '/src/assets/pictures/salad.jpg'        },
      { id: 2, name: 'Grape Mint',        nameFA: 'انگور نعناع',     price: '۴۵۰,۰۰۰', desc: 'انگور تازه با نعناع خنک و یخ',                       image: '/src/assets/pictures/salad.jpg'        },
    ],
  },
};