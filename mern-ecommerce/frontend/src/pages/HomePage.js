import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { PageSkeleton } from '../components/Loading';
import {
  FiTruck, FiBox, FiShield, FiHeadphones, FiCheck, FiPlay, FiChevronLeft, FiChevronRight, FiStar,
} from 'react-icons/fi';

const steps = [
  { n: 1, title: 'Clean Your Face', desc: 'Start with a clean, dry face.' },
  { n: 2, title: 'Wear The Mask', desc: 'Choose your mode and wear for 10-20 minutes.' },
  { n: 3, title: 'Light Therapy', desc: 'The LED light works deep into your skin.' },
  { n: 4, title: 'See The Results', desc: 'Enjoy healthier, brighter, younger-looking skin.' },
];

const testimonials = [
  {
    name: 'Jessica M.',
    quote: 'The YANOVA mask has completely changed my skincare routine. My skin looks brighter and more youthful!',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80',
  },
  {
    name: 'David R.',
    quote: 'Easy to use, high quality, and the results are amazing. Highly recommended!',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
  },
  {
    name: 'Sarah L.',
    quote: 'I love how portable it is. I can use it anywhere, anytime!',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
  },
];

const featuredProduct = {
  name: 'YANOVA Smart Light Therapy Mask',
  description: 'Advanced LED technology to rejuvenate your skin, reduce wrinkles, and boost your natural glow.',
  features: ['7 LED Light Modes', 'Clinically Proven Results', 'Safe, Comfortable & Portable', 'For All Skin Types'],
  price: 129.0,
  originalPrice: 199.0,
  image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
  thumbs: [
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&q=80',
    'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=200&q=80',
    'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=200&q=80',
    'https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=200&q=80',
  ],
};

const Stars = ({ count = 5, className = '' }) => (
  <div className={`flex text-gold-500 ${className}`}>
    {[...Array(count)].map((_, i) => (
      <FiStar key={i} className="w-4 h-4 fill-current" />
    ))}
  </div>
);

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeThumb, setActiveThumb] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await productAPI.getAll();
      setProducts(data.filter((p) => p.status === 'published').slice(0, 8));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextTestimonial = () => setTestimonialIndex((i) => (i + 1) % testimonials.length);
  const prevTestimonial = () => setTestimonialIndex((i) => (i - 1 + testimonials.length) % testimonials.length);

  return (
    <div className="bg-white">
      <Helmet>
        <title>YANOVA — Smart Technology. Better Living.</title>
        <meta
          name="description"
          content="Innovative high-tech products designed to simplify your life. Shop the YANOVA Smart Light Therapy Mask and more."
        />
      </Helmet>

      {/* Hero */}
      <section className="bg-black text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-gold-500 text-xs font-bold tracking-[0.2em] mb-4">THE FUTURE IS YANOVA</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] mb-6">
              Smart Technology.<br />
              <span className="text-gold-500">Better</span> Living.
            </h1>
            <p className="text-gray-400 text-base sm:text-lg mb-8 max-w-md">
              Innovative high-tech products designed to simplify your life.
            </p>
            <Link to="/products" className="btn-primary inline-flex items-center gap-2">
              SHOP NOW
              <FiChevronRight className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-3 mt-8">
              <Stars />
              <span className="text-gray-400 text-sm">Trusted by 10,000+ happy customers</span>
            </div>
          </motion.div>

          <motion.div
            className="relative flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute w-[420px] h-[420px] rounded-full bg-gold-500/20 blur-3xl" />
            <img
              src={featuredProduct.image}
              alt={featuredProduct.name}
              className="relative z-10 w-full max-w-md object-contain rounded-xl"
            />
          </motion.div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-black text-white border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: FiTruck, title: 'FREE SHIPPING', desc: 'On all orders over $50' },
            { icon: FiBox, title: '30-DAY RETURNS', desc: 'Love it or get a refund' },
            { icon: FiShield, title: '1-YEAR WARRANTY', desc: 'Quality you can trust' },
            { icon: FiHeadphones, title: '24/7 SUPPORT', desc: "We're here for you" },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-4">
              <item.icon className="w-7 h-7 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm">{item.title}</p>
                <p className="text-gray-400 text-xs">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured product */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="grid grid-cols-[64px_1fr] gap-4">
            <div className="flex flex-col gap-3">
              {featuredProduct.thumbs.map((thumb, i) => (
                <button
                  key={thumb}
                  onClick={() => setActiveThumb(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    activeThumb === i ? 'border-gold-500' : 'border-gray-200'
                  }`}
                >
                  <img src={thumb} className="w-full h-full object-cover" alt={`Thumbnail ${i + 1}`} />
                </button>
              ))}
            </div>
            <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3]">
              <img
                src={featuredProduct.thumbs[activeThumb]}
                className="w-full h-full object-cover opacity-90"
                alt={featuredProduct.name}
              />
              <button
                aria-label="Play video"
                className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-white/90 flex items-center justify-center hover:scale-105 transition-transform"
              >
                <FiPlay className="w-6 h-6 text-black ml-1" />
              </button>
            </div>
          </div>

          <div>
            <p className="text-gold-600 text-xs font-bold tracking-[0.2em] mb-3">FEATURED PRODUCT</p>
            <h2 className="text-3xl sm:text-4xl font-black mb-4 leading-tight">{featuredProduct.name}</h2>
            <p className="text-gray-500 mb-6 max-w-md">{featuredProduct.description}</p>
            <ul className="space-y-3 mb-7">
              {featuredProduct.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm font-semibold">
                  <span className="w-5 h-5 rounded-full bg-gold-500 flex items-center justify-center flex-shrink-0">
                    <FiCheck className="w-3 h-3 text-black" strokeWidth={3} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-5">
              <Link to="/products" className="btn-primary">VIEW PRODUCT</Link>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black">${featuredProduct.price.toFixed(2)}</span>
                <span className="text-gray-400 line-through text-base">${featuredProduct.originalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-gray-400 text-xs font-bold tracking-[0.2em] mb-3">HOW IT WORKS</p>
            <h2 className="text-3xl sm:text-4xl font-black">Simple. Effective. Life-Changing.</h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
            {steps.map((step) => (
              <div key={step.n} className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="w-16 h-16 rounded-full border border-gray-200 flex items-center justify-center text-2xl font-black text-gray-300">
                    {step.n}
                  </div>
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold-500 text-black text-[11px] font-bold flex items-center justify-center">
                    {step.n}
                  </span>
                </div>
                <h3 className="font-bold text-sm mb-1">{step.title}</h3>
                <p className="text-gray-400 text-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center mb-12">
            <p className="text-gold-500 text-xs font-bold tracking-[0.2em] mb-3">WHAT OUR CUSTOMERS SAY</p>
            <h2 className="text-3xl sm:text-4xl font-black">Real Results. Real People.</h2>
          </div>

          <div className="relative">
            <button
              onClick={prevTestimonial}
              aria-label="Previous testimonial"
              className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-9 h-9 rounded-full border border-white/20 items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-colors"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextTestimonial}
              aria-label="Next testimonial"
              className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-9 h-9 rounded-full border border-white/20 items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-colors"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
              {testimonials.map((t) => (
                <div key={t.name}>
                  <Stars className="mb-3" />
                  <p className="text-gray-300 text-sm mb-5 leading-relaxed">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <img src={t.avatar} className="w-10 h-10 rounded-full object-cover" alt={t.name} />
                    <div>
                      <p className="font-bold text-sm">{t.name}</p>
                      <p className="text-gray-500 text-xs">Verified Buyer</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Product grid */}
      {loading ? (
        <PageSkeleton />
      ) : products.length > 0 && (
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
              <p className="text-gray-400 text-xs font-bold tracking-[0.2em] mb-3">SHOP THE COLLECTION</p>
              <h2 className="text-3xl sm:text-4xl font-black">More From YANOVA</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
