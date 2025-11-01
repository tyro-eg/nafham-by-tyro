import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { useRtlClass } from '../../../assets/utils/utils';

import ReadMore from '../../../component/read-more/read-more.component';
import Carousel from '../../../component/carousel/carousel';

import './home-testimonial.styles.scss';

const testimonials = [
  {
    description:
      'They are professionals and I learned a lot of grammars and Linguistics which helped me to improve my language, Many thanks for Mr. Ahmed Hossam .',
    name: 'Mizo Koki',
    date: new Date(2019, 10, 18),
  },
  {
    description:
      'My experience was with teacher Bendetta ,she is one of the best teachers in Tyro ,she is very talented teacher and have a simple,clear and exciting way in teaching her students and she is friendly💙',
    name: 'Omar AbdElaziz',
    date: new Date(2019, 9, 18),
  },
  {
    description:
      'From my experience with Tyro, the truth is that I strongly recommend it to anyone who wants to learn a language in an easy way and at any time that suits him. 💐🌺',
    name: 'Yasser Nawaya',
    date: new Date(2019, 8, 15),
  },
  {
    description:
      'they are excellent in explaining, especially Mr. Ahmed Ibrahim, he is a giant, and from success to success, and also the technical support is very excellent. Good luck Tyro',
    name: 'Mohamed Hefnawe',
    date: new Date(2021, 1, 7),
  },
  {
    description:
      "She is the best teacher we've dealt with and Ahmed got better at school thanks to god and her, she’s patient and meticulous in her work and can easily deliver information to him. She also always gives him homework and follows up with him",
    name: 'Ahmed Nael',
  },
  {
    description:
      "Based on Judy's opinion, she can really understand from mrs. Mayar and I can see that her grades got better in the school weekly report. So for me, mrs. Mayar is excellent mashaa allah.",
    name: 'Judy Ahmed',
  },
  {
    description:
      "Mrs. Nada's attitude is so kind, she is the best god bless her, we sometimes have to adjust the session schedule but we find her very understanding and cooperative. We’ve been with her from the beginning and haven’t changed to any other teacher. And we will continue with her inshaa allah in the future.",
    name: 'Lina Mahmoud',
  },
  {
    description:
      'Ms. Ghada has been able to quickly warm to both my kids who have very different personalities, which has made a massive impact on their learning and quickly gaining confidence going into exams.  I hope my son takes A-level Maths next as I am now confident he has the correct support for this path.  Thank you Ms. Ghada for your professionalism and kindness throughout this stressful period of their lives.',
    name: 'Layal Tarek',
  },
  {
    description:
      'Miss Dalia is great, i noticed a significant improvement with my daughter, she improved in reading and structure and became more confident in asking questions',
    name: 'Joud Sami',
  },
];

const testimonialsArabic = [
  {
    description:
      'إنهم محترفون وتعلمت الكثير من القواعد واللغويات مما ساعدني على تحسين لغتي ، شكرًا جزيلاً للسيد أحمد حسام.',
    name: 'Mizo Koki',
    date: new Date(2019, 10, 18),
  },
  {
    description:
      'كانت تجربتي مع المعلمة Bendetta ، فهي واحدة من أفضل المعلمين في Tyro ، وهي معلمة موهوبة للغاية ولديها طريقة بسيطة وواضحة ومثيرة في تعليم طلابها وهي ودودة💙',
    name: 'Omar AbdElaziz',
    date: new Date(2019, 9, 18),
  },
  {
    description:
      'من خلال تجربتي مع Tyro الحقيقة بنصح فيه بشدة للي عاوز يتعلم لغة بطريقة سهلة وفي اي وقت يناسبه المعلمين قمة في الأخلاق والحرفية في الإعطاء تفوق احسن المعاهد والفريق الفني له كل الشكر والتقدير على التعامل الرائع 💐🌺',
    name: 'Yasser Nawaya',
    date: new Date(2019, 8, 15),
  },
  {
    description:
      'ما شاء الله ممتازين في الشرح وخصوصا مستر أحمد إبراهيم مشاء الله عملاق ومن نجاح الي نجاح بإذن الله وكذلك الدعم الفني شئ ممتاز جدا بالتوفيق Tyro',
    name: 'Mohamed Hefnawe',
    date: new Date(2021, 1, 7),
  },
  {
    description:
      'إنها أفضل معلمة تعاملنا معها، وتحسن أحمد في المدرسة بفضل الله وبفضلها، فهي صبورة ودقيقة في عملها ويمكنها إيصال المعلومات إليه بسهولة. كما أنها تعطيه دائمًا واجباته المنزلية وتتابع معه',
    name: 'Ahmed Nael',
  },
  {
    description:
      'بناءً على رأي جودي، يمكنها حقًا أن تتفهم من السيدة ميار وأستطيع أن أرى أن درجاتها تحسنت في التقرير الأسبوعي للمدرسة. بالنسبة لي، السيدة ميار ممتازة ما شاء الله.',
    name: 'Judy Ahmed',
  },
  {
    description:
      'تعامل السيدة ندى لطيف للغاية، فهي الأفضل بارك الله فيها، نضطر أحيانًا إلى تعديل جدول الجلسة ولكننا نجدها متفهمة ومتعاونة جدًا. لقد كنا معها منذ البداية ولم نتغير إلى أي معلمة أخرى. وسنواصل معها في المستقبل إن شاء الله.',
    name: 'Lina Mahmoud',
  },
  {
    description:
      'لقد تمكنت السيدة غادة من التقرب سريعًا من أطفالي الذين لديهم شخصيات مختلفة جدًا، مما كان له تأثير كبير على تعلمهم واكتساب الثقة بسرعة قبل الامتحانات.  آمل أن يأخذ ابني الرياضيات على المستوى الأول بعد ذلك لأنني واثق الآن من أنه حصل على الدعم الصحيح لهذا المسار.  شكرًا لك سيدة غادة على احترافيتك ولطفك طوال هذه الفترة العصيبة من حياتهم.',
    name: 'Layal Tarek',
  },
  {
    description:
      'الانسة داليا رائعة، لاحظت تحسنا ملحوظا مع ابنتي، تحسنت في القراءة والتركيب وأصبحت أكثر ثقة في طرح الأسئلة',
    name: 'Joud Sami',
  },
];

const HomeTestimonial: FC = () => {
  const { t, i18n } = useTranslation();
  const rtlClass = useRtlClass();

  return (
    <div className="landing__testimonials">
      <div className={`testimonials-image-container ${rtlClass}`}>
        <div className="container">
          <Carousel small arrows={false}>
            {(i18n.dir() === 'rtl' ? testimonialsArabic : testimonials).map(
              (testimonial, index) => (
                <div key={index}>
                  <p className="title">{t('LANDING.BLOCK5.TITLE')}</p>
                  <ReadMore
                    text={testimonial.description}
                    maxLength={180}
                  ></ReadMore>
                </div>
              ),
            )}
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default HomeTestimonial;
