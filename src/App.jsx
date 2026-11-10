
import { useState } from "react";
import {
  Search, MapPin, ShoppingBag, Heart, Star,
  Clock, ArrowRight, ChefHat, Menu, X,
  Leaf, ShieldCheck, Truck, Plus
} from "lucide-react";

const foods = [
  {
    id: 1,
    name: "Homestyle Veg Thali",
    chef: "Aunty's Kitchen",
    price: 120,
    rating: 4.8,
    time: "30 min",
    category: "Thali",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=700"
  },
  {
    id: 2,
    name: "Rajma Chawal",
    chef: "Maa's Food Corner",
    price: 90,
    rating: 4.9,
    time: "25 min",
    category: "North Indian",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=700"
  },
  {
    id: 3,
    name: "Homemade Paneer",
    chef: "Priya Home Kitchen",
    price: 140,
    rating: 4.7,
    time: "35 min",
    category: "North Indian",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=700"
  },
  {
    id: 4,
    name: "Fresh Veg Pulao",
    chef: "Ghar Ka Zaika",
    price: 100,
    rating: 4.6,
    time: "20 min",
    category: "Rice",
    image: "https://images.unsplash.com/photo-1596560548464-f010549b84d7?w=700"
  }
];

const chefs = [
  {
    name: "Aunty's Kitchen",
    speciality: "Authentic North Indian Food",
    rating: "4.9",
    orders: "500+",
    image: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=500"
  },
  {
    name: "Maa's Food Corner",
    speciality: "Homemade Veg Meals",
    rating: "4.8",
    orders: "350+",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500"
  },
  {
    name: "Priya Home Kitchen",
    speciality: "Fresh Daily Meals",
    rating: "4.9",
    orders: "420+",
    image: "https://images.unsplash.com/photo-1556909190-eccf4a8bf9a5?w=500"
  }
];

const categories = [
  { name: "Thali", emoji: "🍱" },
  { name: "North Indian", emoji: "🍛" },
  { name: "South Indian", emoji: "🥘" },
  { name: "Healthy Food", emoji: "🥗" },
  { name: "Rice", emoji: "🍚" },
  { name: "Snacks", emoji: "🥪" }
];

function App() {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [liked, setLiked] = useState([]);

  const filteredFoods = foods.filter((food) => {
    const matchesSearch =
      food.name.toLowerCase().includes(search.toLowerCase()) ||
      food.chef.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      activeCategory === "All" ||
      food.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const addToCart = (food) => {
    setCart((prev) => [...prev, food]);
  };

  const toggleLike = (id) => {
    setLiked((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#FFFAF5]">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-orange-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

          <a href="#" className="flex items-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#C65D35] text-white">
              <ChefHat size={25} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#C65D35]">
                GharKaSwad
              </h1>
              <p className="text-[10px] tracking-widest text-gray-500">
                TASTE OF HOME
              </p>
            </div>
          </a>

          <div className="hidden items-center gap-2 text-sm md:flex">
            <MapPin size={19} className="text-[#C65D35]" />
            <div>
              <p className="text-xs text-gray-400">Delivering to</p>
              <p className="font-semibold">Varanasi, India</p>
            </div>
          </div>

          <div className="hidden items-center gap-6 md:flex">
            <a href="#food" className="text-sm hover:text-[#C65D35]">
              Explore Food
            </a>
            <a href="#chefs" className="text-sm hover:text-[#C65D35]">
              Home Chefs
            </a>
            <a href="#reviews" className="text-sm hover:text-[#C65D35]">
              Reviews
            </a>
          </div>

          <button className="relative rounded-xl bg-[#C65D35] p-3 text-white">
            <ShoppingBag size={21} />
            {cart.length > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs">
                {cart.length}
              </span>
            )}
          </button>

        </div>
      </nav>

      {/* HERO */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 md:grid-cols-2 md:py-20">

        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-[#C65D35]">
            <Heart size={15} /> Made with love, served with care
          </span>

          <h2 className="mt-6 text-4xl font-extrabold leading-tight md:text-6xl">
            Ghar jaisa khana,
            <span className="block text-[#C65D35]">
              har din.
            </span>
          </h2>

          <p className="mt-5 max-w-lg text-base leading-7 text-gray-500">
            Discover fresh, delicious homemade food prepared
            by talented home chefs near you. Because nothing
            tastes better than home.
          </p>

          <div className="mt-8 flex max-w-xl items-center rounded-2xl border border-orange-100 bg-white p-2 shadow-sm">
            <Search className="ml-2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search homemade food or chef..."
              className="w-full bg-transparent px-3 py-3 text-sm outline-none"
            />
            <button
              onClick={() =>
                document.getElementById("food").scrollIntoView()
              }
              className="rounded-xl bg-[#C65D35] px-5 py-3 text-sm font-semibold text-white"
            >
              Search
            </button>
          </div>

          <div className="mt-8 flex flex-wrap gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <ShieldCheck className="text-green-600" size={19} />
              Trusted Home Chefs
            </span>
            <span className="flex items-center gap-2">
              <Leaf className="text-green-600" size={19} />
              Fresh Homemade Food
            </span>
          </div>
        </div>

        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1547592180-85f173990554?w=1000"
            alt="Homemade Indian food"
            className="h-[330px] w-full rounded-[35px] object-cover shadow-xl md:h-[440px]"
          />
          <div className="absolute -bottom-5 left-4 rounded-2xl bg-white p-4 shadow-lg md:left-[-25px]">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-orange-100 p-3 text-[#C65D35]">
                <ChefHat size={25} />
              </div>
              <div>
                <p className="font-bold">Cooked with love ❤️</p>
                <p className="text-xs text-gray-500">
                  Just like home
                </p>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="mb-7">
          <h2 className="text-2xl font-bold">Explore Categories</h2>
          <p className="mt-1 text-sm text-gray-500">
            Find your favourite homemade meals
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-7">
          <button
            onClick={() => setActiveCategory("All")}
            className={`rounded-2xl border p-4 transition ${
              activeCategory === "All"
                ? "border-[#C65D35] bg-orange-50"
                : "border-orange-100 bg-white"
            }`}
          >
            <span className="text-3xl">🍽️</span>
            <p className="mt-2 text-sm font-semibold">All Food</p>
          </button>

          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setActiveCategory(category.name)}
              className={`rounded-2xl border p-4 transition ${
                activeCategory === category.name
                  ? "border-[#C65D35] bg-orange-50"
                  : "border-orange-100 bg-white hover:border-orange-300"
              }`}
            >
              <span className="text-3xl">{category.emoji}</span>
              <p className="mt-2 text-sm font-semibold">
                {category.name}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* FOOD LIST */}
      <section id="food" className="mx-auto max-w-7xl px-5 py-12">

        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">Popular Homemade Food</h2>
            <p className="mt-1 text-sm text-gray-500">
              Delicious meals prepared by home chefs
            </p>
          </div>
          <span className="rounded-full bg-orange-100 px-4 py-2 text-sm text-[#C65D35]">
            {filteredFoods.length} meals found
          </span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

          {filteredFoods.map((food) => (
            <div
              key={food.id}
              className="overflow-hidden rounded-3xl border border-orange-100 bg-white transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative">
                <img
                  src={food.image}
                  alt={food.name}
                  className="h-52 w-full object-cover"
                />
                <button
                  onClick={() => toggleLike(food.id)}
                  className="absolute right-3 top-3 rounded-full bg-white p-2 shadow"
                >
                  <Heart
                    size={19}
                    className={
                      liked.includes(food.id)
                        ? "fill-red-500 text-red-500"
                        : "text-gray-500"
                    }
                  />
                </button>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-orange-50 px-3 py-1 text-xs text-[#C65D35]">
                    {food.category}
                  </span>
                  <span className="flex items-center gap-1 text-sm font-semibold">
                    <Star size={15} className="fill-yellow-400 text-yellow-400" />
                    {food.rating}
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-bold">{food.name}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  By {food.chef}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xl font-extrabold">₹{food.price}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={13} /> {food.time}
                    </p>
                  </div>

                  <button
                    onClick={() => addToCart(food)}
                    className="flex items-center gap-2 rounded-xl bg-[#C65D35] px-4 py-3 text-sm font-semibold text-white hover:bg-[#a94b29]"
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredFoods.length === 0 && (
            <p className="col-span-full py-10 text-center text-gray-500">
              No food found. Try another search.
            </p>
          )}

        </div>
      </section>

      {/* HOME CHEFS */}
      <section id="chefs" className="bg-[#F7F0E8] py-16">
        <div className="mx-auto max-w-7xl px-5">

          <div className="mb-9">
            <span className="text-sm font-semibold text-[#C65D35]">
              MEET OUR COOKS
            </span>
            <h2 className="mt-2 text-3xl font-bold">
              Meet Your Home Chefs
            </h2>
            <p className="mt-2 text-gray-500">
              Real people, real kitchens, authentic homemade food.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {chefs.map((chef) => (
              <div
                key={chef.name}
                className="rounded-3xl bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={chef.image}
                    alt={chef.name}
                    className="h-20 w-20 rounded-2xl object-cover"
                  />
                  <div>
                    <h3 className="font-bold">{chef.name}</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      {chef.speciality}
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-sm">
                      <Star size={15} className="fill-yellow-400 text-yellow-400"/>
                      {chef.rating}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 text-sm">
                  <span className="text-gray-500">
                    {chef.orders} orders
                  </span>
                  <button className="flex items-center gap-1 font-semibold text-[#C65D35]">
                    View Profile <ArrowRight size={15}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY GHARKASWAD */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="mb-10 text-center">
          <span className="text-sm font-semibold text-[#C65D35]">
            WHY GHARKASWAD?
          </span>
          <h2 className="mt-2 text-3xl font-bold">
            More than just food delivery
          </h2>
        </div>

        <div className="grid gap-8 text-center md:grid-cols-3">
          <div>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-[#C65D35]">
              <Heart size={30}/>
            </div>
            <h3 className="mt-4 font-bold">Made with Love</h3>
            <p className="mt-2 text-sm text-gray-500">
              Enjoy the comfort of homemade meals wherever you live.
            </p>
          </div>

          <div>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-green-100 text-green-700">
              <ChefHat size={30}/>
            </div>
            <h3 className="mt-4 font-bold">Support Home Chefs</h3>
            <p className="mt-2 text-sm text-gray-500">
              Help homemakers turn their cooking skills into income.
            </p>
          </div>

          <div>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-[#C65D35]">
              <ShieldCheck size={30}/>
            </div>
            <h3 className="mt-4 font-bold">Trusted Experience</h3>
            <p className="mt-2 text-sm text-gray-500">
              Discover chefs with transparent profiles and customer reviews.
            </p>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mb-9 text-center">
            <h2 className="text-3xl font-bold">What Customers Say</h2>
            <p className="mt-2 text-gray-500">
              Experiences from our homemade food community
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Rahul Sharma",
                review: "Finally, I found food that tastes just like my mother's cooking. Really loved it!",
              },
              {
                name: "Anjali Verma",
                review: "The food is fresh, affordable and delicious. Perfect for students living away from home.",
              },
              {
                name: "Amit Kumar",
                review: "I love supporting local home chefs. The quality and taste are amazing.",
              }
            ].map((item) => (
              <div key={item.name} className="rounded-3xl bg-[#FFFAF5] p-6">
                <div className="flex gap-1 text-yellow-500">
                  {[1,2,3,4,5].map((n) => (
                    <Star key={n} size={16} className="fill-yellow-400"/>
                  ))}
                </div>
                <p className="my-5 text-sm leading-7 text-gray-600">
                  "{item.review}"
                </p>
                <p className="font-bold">{item.name}</p>
                <p className="text-xs text-gray-400">Customer</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#292521] px-5 py-12 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
          <div>
            <h2 className="text-2xl font-extrabold text-orange-400">
              GharKaSwad
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-7 text-gray-400">
              Bringing the taste of homemade food closer to everyone,
              while helping local home chefs grow their businesses.
            </p>
          </div>

          <div>
            <h3 className="font-bold">Explore</h3>
            <div className="mt-4 flex flex-col gap-3 text-sm text-gray-400">
              <a href="#food">Homemade Food</a>
              <a href="#chefs">Home Chefs</a>
              <a href="#reviews">Customer Reviews</a>
            </div>
          </div>

          <div>
            <h3 className="font-bold">Our Mission</h3>
            <p className="mt-4 text-sm leading-7 text-gray-400">
              Ghar ka khana, apno jaisa sukoon.
            </p>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-7xl border-t border-gray-700 pt-6 text-center text-xs text-gray-500">
          © 2026 GharKaSwad. All rights reserved.
        </div>
      </footer>

    </div>
  );
}

export default App;