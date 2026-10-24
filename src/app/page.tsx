"use client";

import { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  color: string;
  image: string;
  stock: number;
};

type CartItem = {
  id: number;
  quantity: number;
};

type Order = {
  id: string;
  total: number;
  pieces: number;
};

const initialProducts: Product[] = [
  {
    id: 1,
    name: "The Everyday Bag",
    category: "Bags",
    price: 89,
    color: "Midnight",
    stock: 14,
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=85&fit=crop",
  },
  {
    id: 2,
    name: "The Sunday Knit",
    category: "Clothing",
    price: 78,
    color: "Soft oat",
    stock: 18,
    image:
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=85&fit=crop",
  },
  {
    id: 3,
    name: "The Evening Edit",
    category: "Clothing",
    price: 129,
    color: "Rose",
    stock: 8,
    image:
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=85&fit=crop",
  },
  {
    id: 4,
    name: "The Essential Shirt",
    category: "Clothing",
    price: 65,
    color: "Cloud",
    stock: 22,
    image:
      "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=800&q=85&fit=crop",
  },
];

const formatPrice = (price: number) => `£${price.toFixed(2)}`;

export default function Home() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("Featured");
  const [showWishlist, setShowWishlist] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [studioOpen, setStudioOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [videoError, setVideoError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStock, setProductStock] = useState("10");
  const [productCategory, setProductCategory] = useState("Clothing");
  const [description, setDescription] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("velora-demo-v1");

      if (saved) {
        const data = JSON.parse(saved);

        if (Array.isArray(data.products)) setProducts(data.products);
        if (Array.isArray(data.cart)) setCart(data.cart);
        if (Array.isArray(data.orders)) setOrders(data.orders);
        if (Array.isArray(data.wishlist)) setWishlist(data.wishlist);
      }
    } catch {
      // Start with the sample collection if saved data is unavailable.
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(
        "velora-demo-v1",
        JSON.stringify({ products, cart, orders, wishlist })
      );
    } catch {
      // The demo still works when browser storage is unavailable.
    }
  }, [products, cart, orders, wishlist, loaded]);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    document.body.style.overflow =
      cartOpen || studioOpen ? "hidden" : "";

    function closeWithEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setCartOpen(false);
        setStudioOpen(false);
      }
    }

    window.addEventListener("keydown", closeWithEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeWithEscape);
    };
  }, [cartOpen, studioOpen]);

  const visibleProducts = products
    .filter((product) => {
      const matchesCategory =
        category === "All" || product.category === category;

      const matchesSearch =
        `${product.name} ${product.color} ${product.category}`
          .toLowerCase()
          .includes(query.toLowerCase());

      const matchesWishlist =
        !showWishlist || wishlist.includes(product.id);

      return matchesCategory && matchesSearch && matchesWishlist;
    })
    .sort((a, b) => {
      if (sort === "Price: low to high") return a.price - b.price;
      if (sort === "Price: high to low") return b.price - a.price;
      return 0;
    });

  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cart.reduce((total, item) => {
    const product = products.find((p) => p.id === item.id);
    return total + (product?.price ?? 0) * item.quantity;
  }, 0);

  const revenue = orders.reduce((total, order) => total + order.total, 0);

  function scrollToShop(nextCategory = "All") {
    setCategory(nextCategory);
    setShowWishlist(false);
    setMenuOpen(false);

    document.getElementById("collection")?.scrollIntoView({
      behavior: "smooth",
    });
  }

  function toggleWishlist(id: number) {
    setWishlist((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function addToCart(product: Product) {
    const currentQuantity =
      cart.find((item) => item.id === product.id)?.quantity ?? 0;

    if (currentQuantity >= product.stock) {
      setToast("You have selected all available stock.");
      return;
    }

    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);

      return existing
        ? current.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...current, { id: product.id, quantity: 1 }];
    });

    setToast(`${product.name} added to your bag.`);
  }

  function changeQuantity(id: number, change: number) {
    const product = products.find((item) => item.id === id);
    if (!product) return;

    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: Math.min(product.stock, item.quantity + change),
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function placeDemoOrder() {
    if (!cart.length) return;

    const invalid = cart.some((item) => {
      const product = products.find((p) => p.id === item.id);
      return !product || item.quantity > product.stock;
    });

    if (invalid) {
      setToast("Stock changed. Please check your bag.");
      return;
    }

    const order: Order = {
      id: `VL-${Date.now().toString().slice(-7)}`,
      total: cartTotal,
      pieces: cartCount,
    };

    setOrders((current) => [order, ...current]);

    setProducts((current) =>
      current.map((product) => ({
        ...product,
        stock:
          product.stock -
          (cart.find((item) => item.id === product.id)?.quantity ?? 0),
      }))
    );

    setCart([]);
    setCartOpen(false);
    setToast(`Demo order ${order.id} saved. No payment collected.`);
  }

  function createDraft() {
    if (!productName.trim()) {
      setToast("Enter a product name first.");
      return;
    }

    setDescription(
      `Meet ${productName.trim()}: a fresh addition to your everyday edit. ` +
        `Style it your way and make it part of the moments that matter. ` +
        `Add verified material, size and care information before publishing.`
    );
  }

  function publishProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const price = Number(productPrice);
    const stock = Number(productStock);

    if (
      !productName.trim() ||
      !Number.isFinite(price) ||
      price <= 0 ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      setToast("Please check the product details.");
      return;
    }

    const image =
      productCategory === "Bags"
        ? initialProducts[0].image
        : initialProducts[1].image;

    setProducts((current) => [
      ...current,
      {
        id: Date.now(),
        name: productName.trim(),
        category: productCategory,
        price,
        stock,
        color: "New edition",
        image,
      },
    ]);

    setProductName("");
    setProductPrice("");
    setProductStock("10");
    setDescription("");
    setToast("Product added to your local demo store.");
  }

  return (
    <div className="min-h-screen bg-[#fffaf4] text-[#392334]">
      {/* Announcement */}
      <div className="flex items-center justify-center bg-[#f8df75] px-4 py-2.5 text-center text-[10px] font-medium tracking-[0.12em] sm:text-xs">
        A LITTLE COLOUR. A LOT OF YOU. ✳ MEET YOUR NEW EVERYDAY.
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-30 border-b border-[#392334]/10 bg-[#fffaf4]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 lg:px-12">
          <a
            href="#"
            className="font-serif text-3xl tracking-[0.2em] sm:text-4xl"
          >
            VELORA<span className="text-[#d75282]">.</span>
          </a>

          <nav className="hidden items-center gap-8 text-xs md:flex">
            <button onClick={() => scrollToShop()}>The collection</button>
            <a href="#story">Our world</a>
            <a href="#film">The film ↗</a>
            <button onClick={() => setStudioOpen(true)}>
              Seller studio ↗
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              aria-label="Show saved products"
              onClick={() => {
                setShowWishlist((current) => !current);
                document
                  .getElementById("collection")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="rounded-full border border-[#392334]/15 px-3 py-2 text-sm transition hover:bg-[#f7d5df]"
            >
              ♡ <span className="text-xs">{wishlist.length}</span>
            </button>

            <button
              onClick={() => setCartOpen(true)}
              className="rounded-full bg-[#392334] px-4 py-2.5 text-xs text-white transition hover:bg-[#743953]"
            >
              Bag ({cartCount})
            </button>

            <button
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
              className="px-2 text-xl md:hidden"
            >
              ☰
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="flex flex-col gap-5 border-t border-[#392334]/10 px-6 py-6 text-sm md:hidden">
            <button
              className="text-left"
              onClick={() => scrollToShop()}
            >
              The collection
            </button>
            <a href="#story" onClick={() => setMenuOpen(false)}>
              Our world
            </a>
            <a href="#film" onClick={() => setMenuOpen(false)}>
              The film
            </a>
            <button
              className="text-left"
              onClick={() => {
                setMenuOpen(false);
                setStudioOpen(true);
              }}
            >
              Seller studio ↗
            </button>
          </nav>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-[1440px] lg:min-h-[690px] lg:grid-cols-[1.02fr_1fr]">
          <div className="relative overflow-hidden bg-[#f6d5df] px-6 py-14 sm:px-12 sm:py-20 lg:px-16">
            <span className="absolute -right-8 top-8 text-[180px] leading-none text-[#e6a3bb]/40">
              ✳
            </span>

            <div className="relative z-10">
              <p className="text-[10px] font-semibold tracking-[0.24em]">
                THE COLOURFUL EVERYDAY / EDIT 01
              </p>

              <h1 className="mt-9 font-serif text-[68px] leading-[0.98] tracking-[-0.06em] sm:text-[90px] xl:text-[112px]">
                Ordinary?
                <br />
                <span className="italic text-[#a83c65]">Never you.</span>
              </h1>

              <p className="mt-7 max-w-sm text-sm leading-7 text-[#705160]">
                A fresh perspective on getting dressed.
                Thoughtful pieces, playful details, and a little
                everyday extraordinary.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-6">
                <button
                  onClick={() => scrollToShop()}
                  className="flex items-center gap-8 rounded-full bg-[#392334] px-7 py-4 text-xs text-white transition hover:-translate-y-1 hover:bg-[#743953]"
                >
                  Find your favourites <span>↗</span>
                </button>

                <a
                  href="#film"
                  className="border-b border-[#392334]/40 pb-1 text-xs"
                >
                  Watch our world ↗
                </a>
              </div>

              <div className="mt-14 flex items-center gap-4 border-t border-[#392334]/15 pt-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f8df75] text-xl">
                  ✳
                </div>
                <p className="text-[10px] leading-5 tracking-wider">
                  A CONSIDERED COLLECTION.
                  <br />
                  AN UNEXPECTED POINT OF VIEW.
                </p>
              </div>
            </div>
          </div>

          <div className="relative min-h-[520px] overflow-hidden bg-[#ddcec5] lg:min-h-full">
            <img
              src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1400&q=90&fit=crop"
              alt="Fashion editorial with a blue coat and a pink shoulder bag"
              className="absolute inset-0 h-full w-full object-cover object-[center_35%]"
              fetchPriority="high"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

            <div className="absolute left-6 right-6 top-6 flex justify-between text-[9px] tracking-[0.16em] text-white">
              <span>A VELORA POINT OF VIEW</span>
              <span>01 / EVERYDAY ICONS</span>
            </div>

            <div className="absolute right-6 top-16 flex h-24 w-24 rotate-12 items-center justify-center rounded-full bg-[#f8df75] text-center text-[10px] font-semibold leading-4 shadow-lg sm:h-28 sm:w-28">
              GOOD STYLE.
              <br />
              GREAT ENERGY.
              <br />
              ↗
            </div>

            <button
              onClick={() => scrollToShop("Bags")}
              className="absolute bottom-6 left-6 right-6 flex items-center gap-4 rounded-2xl bg-[#fffaf4]/95 p-4 text-left backdrop-blur sm:right-auto sm:w-[310px]"
            >
              <img
                src={initialProducts[0].image}
                alt="Featured black handbag"
                className="h-16 w-14 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="text-[8px] tracking-widest text-[#947385]">
                  SMALL DETAILS. BIG FEELING.
                </p>
                <p className="mt-2 text-sm">The Everyday Bag</p>
                <p className="mt-1 text-xs">Explore the edit</p>
              </div>
              <span className="text-xl">↗</span>
            </button>
          </div>
        </section>

        {/* Brand strip */}
        <div className="overflow-hidden border-y border-[#392334]/10 bg-[#f8df75] py-5">
          <div className="flex min-w-max justify-around gap-10 px-8 text-[11px] font-medium tracking-[0.2em]">
            <span>LESS ORDINARY</span>
            <span>✳</span>
            <span>MORE POSSIBILITY</span>
            <span>✳</span>
            <span>YOUR EVERYDAY EDIT</span>
            <span>✳</span>
            <span>COLOUR OUTSIDE THE LINES</span>
            <span>✳</span>
          </div>
        </div>

        {/* Collection */}
        <section
          id="collection"
          className="mx-auto max-w-[1440px] scroll-mt-28 px-5 py-16 sm:px-10 lg:px-12 lg:py-24"
        >
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-[10px] tracking-[0.22em] text-[#a45876]">
                GOOD PIECES. GREAT POSSIBILITIES.
              </p>
              <h2 className="mt-4 font-serif text-4xl tracking-tight sm:text-5xl lg:text-6xl">
                {showWishlist ? "Your little favourites." : "The everyday edit."}
              </h2>
            </div>
            <p className="max-w-xs text-xs leading-6 text-[#88717d]">
              Familiar favourites meet unexpected finds.
              Make a little room for something lovely.
            </p>
          </div>

          <div className="mt-9 flex flex-col gap-5 border-b border-[#392334]/10 pb-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              {["All", "Clothing", "Bags", "Accessories"].map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`rounded-full px-5 py-2.5 text-xs transition ${
                    category === item
                      ? "bg-[#392334] text-white"
                      : "bg-[#f1e9e8] hover:bg-[#f6d5df]"
                  }`}
                >
                  {item === "All" ? "The full edit" : item}
                </button>
              ))}

              {showWishlist && (
                <button
                  onClick={() => setShowWishlist(false)}
                  className="rounded-full bg-[#f6d5df] px-4 py-2 text-xs"
                >
                  Saved only ×
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <input
                aria-label="Search products"
                placeholder="Search your next favourite..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-w-0 flex-1 rounded-full border border-[#392334]/15 bg-transparent px-4 py-3 text-xs outline-none focus:border-[#b44470]"
              />
              <select
                aria-label="Sort products"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="max-w-[160px] rounded-full border border-[#392334]/15 bg-transparent px-3 py-3 text-xs"
              >
                <option>Featured</option>
                <option>Price: low to high</option>
                <option>Price: high to low</option>
              </select>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 lg:grid-cols-4 lg:gap-x-6">
            {visibleProducts.map((product, index) => (
              <article key={product.id} className="group">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[22px] bg-[#eee5df]">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />

                  <span
                    className={`absolute left-3 top-3 rounded-full px-3 py-1.5 text-[8px] font-medium ${
                      index % 2 === 0
                        ? "bg-[#f8df75]"
                        : "bg-[#f6d5df]"
                    }`}
                  >
                    {product.stock === 0
                      ? "SOLD OUT"
                      : index === 0
                        ? "THE EVERYDAY ICON"
                        : "A FRESH FAVOURITE"}
                  </span>

                  <button
                    aria-label={`Save ${product.name}`}
                    aria-pressed={wishlist.includes(product.id)}
                    onClick={() => toggleWishlist(product.id)}
                    className="absolute right-3 top-12 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-xl shadow-sm sm:top-3"
                  >
                    {wishlist.includes(product.id) ? "♥" : "♡"}
                  </button>

                  <button
                    disabled={product.stock === 0}
                    onClick={() => addToCart(product)}
                    className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-full bg-[#fffaf4]/95 px-4 py-3 text-[10px] transition hover:bg-[#f8df75] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {product.stock === 0 ? "Currently unavailable" : "Add to your bag"}
                    <span className="text-base">+</span>
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap justify-between gap-2 text-xs sm:text-sm">
                  <h3>{product.name}</h3>
                  <span>{formatPrice(product.price)}</span>
                </div>

                <p className="mt-2 text-[10px] text-[#927f88]">
                  {product.color} · {product.stock} available
                </p>
              </article>
            ))}
          </div>

          {visibleProducts.length === 0 && (
            <div className="rounded-3xl bg-[#f5ecee] px-6 py-16 text-center">
              <p className="font-serif text-3xl">A little room for discovery.</p>
              <p className="mt-4 text-sm text-[#88717d]">
                No pieces match this selection yet.
              </p>
              <button
                onClick={() => {
                  setCategory("All");
                  setQuery("");
                  setShowWishlist(false);
                }}
                className="mt-6 border-b border-[#392334] pb-1 text-xs"
              >
                Explore everything ↗
              </button>
            </div>
          )}
        </section>

        {/* Feature block */}
        <section className="mx-auto max-w-[1440px] px-5 sm:px-10 lg:px-12">
          <div className="grid overflow-hidden rounded-[30px] bg-[#f8df75] md:grid-cols-[1.3fr_1fr]">
            <div className="relative px-7 py-12 sm:px-12">
              <p className="text-[10px] tracking-[0.2em]">
                YOUR SHOP, WITH A LITTLE EXTRA POSSIBILITY
              </p>
              <h2 className="mt-5 max-w-lg font-serif text-4xl leading-tight sm:text-5xl">
                Beautiful on the outside.
                <br />
                <span className="italic">Thoughtful behind the scenes.</span>
              </h2>
              <p className="mt-6 max-w-sm text-xs leading-6 text-[#796138]">
                Explore the seller studio. Add products, check stock and
                follow your demo orders in one considered space.
              </p>
              <button
                onClick={() => setStudioOpen(true)}
                className="mt-8 rounded-full bg-[#392334] px-7 py-4 text-xs text-white transition hover:-translate-y-1"
              >
                Explore seller studio ↗
              </button>
            </div>

            <div className="flex items-center justify-center bg-[#f3ccdf] p-8 sm:p-12">
              <div className="w-full max-w-sm -rotate-3 rounded-3xl bg-[#fffaf4] p-6 shadow-[12px_16px_0_#39233415] transition hover:rotate-0">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] tracking-widest">VELORA STUDIO</p>
                  <span className="rounded-full bg-[#f8df75] px-3 py-1 text-[9px]">
                    LOCAL DEMO
                  </span>
                </div>

                <p className="mt-8 text-xs text-[#947c88]">Your demo revenue</p>
                <p className="mt-2 font-serif text-5xl">
                  {formatPrice(revenue)}
                </p>

                <div className="mt-7 flex h-24 items-end gap-3">
                  {[25, 48, 35, 70, 55, 88, 100].map((height, index) => (
                    <div
                      key={index}
                      style={{ height: `${height}%` }}
                      className={`flex-1 rounded-t-lg ${
                        index === 6 ? "bg-[#392334]" : "bg-[#efb4cb]"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-3 text-[9px] text-[#947c88]">
                  Decorative chart · Summary above uses your demo orders
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Video */}
        <section
          id="film"
          className="mx-auto max-w-[1440px] scroll-mt-28 px-5 py-16 sm:px-10 lg:px-12 lg:py-24"
        >
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[10px] tracking-[0.2em] text-[#a45876]">
                THE VELORA MOTION EDIT
              </p>
              <h2 className="mt-4 font-serif text-4xl sm:text-5xl">
                A world in <span className="italic">colour.</span>
              </h2>
            </div>
            <p className="text-xs text-[#88717d]">
              A little movement. A fresh perspective.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[30px] bg-[#392334]">
            {!videoError ? (
              <video
                controls
                playsInline
                preload="none"
                poster="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=85&fit=crop"
                aria-label="VELORA fashion film"
                className="aspect-video max-h-[650px] w-full object-cover"
                onError={() => setVideoError(true)}
              >
                <source
                  src="/videos/velora-fashion.mp4"
                  type="video/mp4"
                />
                Your browser does not support this video.
              </video>
            ) : (
              <div className="relative flex min-h-[330px] items-center justify-center p-8 text-center sm:min-h-[500px]">
                <img
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&q=85&fit=crop"
                  alt="Fashion shopping editorial"
                  className="absolute inset-0 h-full w-full object-cover opacity-35"
                />
                <div className="relative text-white">
                  <p className="text-4xl">▷</p>
                  <h3 className="mt-5 font-serif text-4xl">
                    Your motion edit belongs here.
                  </h3>
                  <p className="mx-auto mt-5 max-w-md text-xs leading-6">
                    Add your 30-second MP4 as
                    <br />
                    public/videos/velora-fashion.mp4
                    <br />
                    then refresh this page.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Story */}
        <section
          id="story"
          className="mx-auto grid max-w-[1440px] scroll-mt-28 md:grid-cols-2"
        >
          <div className="relative min-h-[440px] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1000&q=85&fit=crop"
              alt="Friends enjoying a day exploring fashion"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span className="absolute bottom-7 left-7 rounded-full bg-[#f8df75] px-5 py-2 text-[10px]">
              GOOD COMPANY. GREAT STYLE.
            </span>
          </div>

          <div className="flex flex-col justify-center bg-[#f6d5df] px-7 py-14 sm:px-14 lg:px-20">
            <p className="text-[10px] tracking-[0.22em]">
              THE VELORA POINT OF VIEW
            </p>
            <h2 className="mt-6 font-serif text-5xl leading-[1.05] lg:text-6xl">
              Wear a little
              <br />
              <span className="italic text-[#a83c65]">more you.</span>
            </h2>
            <p className="mt-7 max-w-md text-sm leading-7 text-[#795564]">
              We like pieces with personality. The ones that make a quiet
              morning feel brighter, an ordinary outing feel special,
              and getting dressed feel like yourself.
            </p>
            <p className="mt-4 max-w-md text-sm leading-7 text-[#795564]">
              VELORA is a student concept store celebrating a more
              colourful everyday.
            </p>
            <button
              onClick={() => scrollToShop()}
              className="mt-8 w-fit border-b border-[#392334]/50 pb-2 text-xs"
            >
              Find your point of view ↗
            </button>
          </div>
        </section>

        {/* Closing */}
        <section className="px-6 py-20 text-center lg:py-28">
          <p className="text-[10px] tracking-[0.25em] text-[#a45876]">
            YOUR NEXT FAVOURITE IS WAITING
          </p>
          <h2 className="mx-auto mt-6 max-w-3xl font-serif text-5xl leading-tight sm:text-6xl lg:text-7xl">
            Life looks lovely
            <br />
            <span className="italic">in your colours.</span>
          </h2>
          <button
            onClick={() => scrollToShop()}
            className="mt-9 rounded-full bg-[#f8df75] px-8 py-4 text-xs transition hover:-translate-y-1 hover:bg-[#f1ce4e]"
          >
            Discover the collection ↗
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#392334] px-6 pb-6 pt-12 text-[#fffaf4] sm:px-12">
        <div className="mx-auto grid max-w-[1344px] gap-10 pb-12 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <p className="font-serif text-5xl tracking-[0.15em]">
              VELORA<span className="text-[#f8df75]">.</span>
            </p>
            <p className="mt-5 text-xs text-[#d4b7c6]">
              A little colour. A lot of you.
            </p>
          </div>

          <div className="flex flex-col items-start gap-4 text-xs">
            <p className="mb-1 text-[9px] tracking-widest text-[#f8df75]">
              DISCOVER
            </p>
            <button onClick={() => scrollToShop()}>The collection</button>
            <a href="#story">Our world</a>
            <a href="#film">The motion edit</a>
            <button onClick={() => setStudioOpen(true)}>Seller studio</button>
          </div>

          <div className="text-xs leading-7 text-[#d4b7c6]">
            <p className="mb-3 text-[9px] tracking-widest text-[#f8df75]">
              ABOUT THIS PROJECT
            </p>
            <p>Student e-commerce concept.</p>
            <p>Orders are local demos.</p>
            <p>No payments collected.</p>
            <p>Sample photography: Unsplash.</p>
          </div>
        </div>

        <div className="mx-auto flex max-w-[1344px] flex-wrap justify-between gap-4 border-t border-white/15 pt-6 text-[9px] text-[#d4b7c6]">
          <span>VELORA · Designed with a fresh perspective.</span>
          <span>CONSIDERED IN EVERY DETAIL. ✳</span>
        </div>
      </footer>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-[100] w-max max-w-[92vw] -translate-x-1/2 rounded-2xl bg-[#392334] px-6 py-4 text-center text-xs leading-5 text-white shadow-2xl"
        >
          {toast}
        </div>
      )}

      {/* Shopping bag */}
      {cartOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-[#25121f]/55 backdrop-blur-sm"
          onClick={() => setCartOpen(false)}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Your shopping bag"
            onClick={(event) => event.stopPropagation()}
            className="flex h-full w-full max-w-md flex-col bg-[#fffaf4] p-6 sm:p-8"
          >
            <div className="flex items-center justify-between border-b border-[#392334]/15 pb-6">
              <h2 className="font-serif text-3xl">Your lovely little bag.</h2>
              <button
                aria-label="Close bag"
                onClick={() => setCartOpen(false)}
                className="px-2 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {!cart.length && (
                <div className="py-20 text-center">
                  <p className="text-5xl text-[#ba6283]">♡</p>
                  <p className="mt-6 font-serif text-3xl">
                    A little room for lovely.
                  </p>
                  <p className="mt-4 text-xs text-[#947c88]">
                    Your bag is waiting for its first favourite.
                  </p>
                  <button
                    onClick={() => {
                      setCartOpen(false);
                      scrollToShop();
                    }}
                    className="mt-7 rounded-full bg-[#f8df75] px-6 py-3 text-xs"
                  >
                    Explore the edit ↗
                  </button>
                </div>
              )}

              {cart.map((item) => {
                const product = products.find((p) => p.id === item.id);
                if (!product) return null;

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 border-b border-[#392334]/10 py-6"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-28 w-20 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-sm">{product.name}</h3>
                      <p className="mt-2 text-xs text-[#947c88]">
                        {product.color}
                      </p>
                      <p className="mt-3 text-xs">
                        {formatPrice(product.price)}
                      </p>
                      <div className="mt-3 flex w-24 items-center justify-between rounded-full border border-[#392334]/20 px-2">
                        <button
                          aria-label={`Reduce ${product.name}`}
                          onClick={() => changeQuantity(item.id, -1)}
                          className="p-2"
                        >
                          −
                        </button>
                        <span className="text-xs">{item.quantity}</span>
                        <button
                          aria-label={`Increase ${product.name}`}
                          disabled={item.quantity >= product.stock}
                          onClick={() => changeQuantity(item.id, 1)}
                          className="p-2 disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      aria-label={`Remove ${product.name}`}
                      onClick={() =>
                        setCart((current) =>
                          current.filter((entry) => entry.id !== item.id)
                        )
                      }
                      className="self-start px-2 text-lg"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>

            {!!cart.length && (
              <div className="border-t border-[#392334]/15 pt-6">
                <div className="flex justify-between text-sm">
                  <span>Demo subtotal</span>
                  <strong>{formatPrice(cartTotal)}</strong>
                </div>
                <p className="my-4 text-[10px] leading-5 text-[#947c88]">
                  Demo checkout only. No payment or delivery details
                  are collected. Records stay in this browser.
                </p>
                <button
                  onClick={placeDemoOrder}
                  className="w-full rounded-full bg-[#392334] py-4 text-xs text-white"
                >
                  Place demo order ↗
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Seller studio */}
      {studioOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-[#25121f]/55 p-3 backdrop-blur-sm sm:p-8"
          onClick={() => setStudioOpen(false)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Seller studio"
            onClick={(event) => event.stopPropagation()}
            className="mx-auto max-w-6xl overflow-hidden rounded-[28px] bg-[#fffaf4]"
          >
            <div className="flex items-center justify-between border-b border-[#392334]/10 bg-[#f6d5df] px-6 py-6 sm:px-9">
              <div>
                <p className="text-[9px] tracking-[0.2em]">
                  VELORA / COMMERCE STUDIO
                </p>
                <h2 className="mt-3 font-serif text-3xl sm:text-4xl">
                  Behind the lovely.
                </h2>
              </div>
              <button
                aria-label="Close seller studio"
                onClick={() => setStudioOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/60 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 sm:p-9">
              <p className="text-[10px] leading-5 text-[#947c88]">
                LOCAL DEMO WORKSPACE · Saved in this browser ·
                No authentication or live AI connected
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                {[
                  ["Demo revenue", formatPrice(revenue)],
                  ["Demo orders", orders.length],
                  ["Collection pieces", products.length],
                  [
                    "Low-stock products",
                    products.filter((p) => p.stock < 10).length,
                  ],
                ].map(([label, value], index) => (
                  <div
                    key={label}
                    className={`rounded-2xl p-5 ${
                      index % 2 === 0
                        ? "bg-[#f9e797]"
                        : "bg-[#f5dce5]"
                    }`}
                  >
                    <p className="text-[10px]">{label}</p>
                    <p className="mt-4 font-serif text-3xl">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-8 lg:grid-cols-2">
                <form
                  onSubmit={publishProduct}
                  className="rounded-2xl border border-[#392334]/15 p-5 sm:p-7"
                >
                  <h3 className="font-serif text-2xl">
                    Add something exceptional.
                  </h3>

                  <label className="mt-6 block text-xs">
                    Product name
                    <input
                      required
                      maxLength={90}
                      value={productName}
                      onChange={(event) =>
                        setProductName(event.target.value)
                      }
                      placeholder="The Weekend Cardigan"
                      className="mt-2 w-full rounded-xl border border-[#392334]/15 bg-white p-3 outline-none focus:border-[#b44470]"
                    />
                  </label>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <label className="text-xs">
                      Price (£)
                      <input
                        required
                        type="number"
                        min="0.01"
                        max="10000"
                        step="0.01"
                        value={productPrice}
                        onChange={(event) =>
                          setProductPrice(event.target.value)
                        }
                        className="mt-2 w-full rounded-xl border border-[#392334]/15 bg-white p-3"
                      />
                    </label>

                    <label className="text-xs">
                      Stock
                      <input
                        required
                        type="number"
                        min="0"
                        max="10000"
                        step="1"
                        value={productStock}
                        onChange={(event) =>
                          setProductStock(event.target.value)
                        }
                        className="mt-2 w-full rounded-xl border border-[#392334]/15 bg-white p-3"
                      />
                    </label>
                  </div>

                  <label className="mt-4 block text-xs">
                    Category
                    <select
                      value={productCategory}
                      onChange={(event) =>
                        setProductCategory(event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-[#392334]/15 bg-white p-3"
                    >
                      <option>Clothing</option>
                      <option>Bags</option>
                      <option>Accessories</option>
                    </select>
                  </label>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <label htmlFor="product-description" className="text-xs">
                      Writing preview
                    </label>
                    <button
                      type="button"
                      onClick={createDraft}
                      className="rounded-full bg-[#f8df75] px-3 py-2 text-[10px]"
                    >
                      ✳ Generate template
                    </button>
                  </div>

                  <textarea
                    id="product-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    rows={4}
                    placeholder="Create a draft, then make it your own..."
                    className="mt-3 w-full rounded-xl border border-[#392334]/15 bg-white p-3 text-xs leading-6"
                  />

                  <p className="mt-3 text-[10px] leading-5 text-[#947c88]">
                    Template preview, not live AI. New products use a
                    sample collection photo. This draft is for practice.
                  </p>

                  <button
                    type="submit"
                    className="mt-5 w-full rounded-full bg-[#392334] py-4 text-xs text-white"
                  >
                    Add product to demo store ↗
                  </button>
                </form>

                <div className="space-y-6">
                  <div className="rounded-2xl border border-[#392334]/15 p-5 sm:p-7">
                    <h3 className="font-serif text-2xl">
                      Your latest orders.
                    </h3>

                    {!orders.length ? (
                      <p className="mt-5 text-xs leading-6 text-[#947c88]">
                        Place a demo order from your bag.
                        It will appear here and update your stock.
                      </p>
                    ) : (
                      <div className="mt-5 max-h-64 overflow-y-auto">
                        {orders.map((order) => (
                          <div
                            key={order.id}
                            className="flex items-center justify-between gap-3 border-b border-[#392334]/10 py-4 text-xs"
                          >
                            <div>
                              <p>{order.id}</p>
                              <p className="mt-2 text-[10px] text-[#947c88]">
                                {order.pieces} piece(s) · Demo order
                              </p>
                            </div>
                            <strong>{formatPrice(order.total)}</strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl bg-[#f5dce5] p-5 sm:p-7">
                    <h3 className="font-serif text-2xl">
                      A little stock check.
                    </h3>
                    <div className="mt-5 max-h-64 overflow-y-auto">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between gap-3 border-b border-[#392334]/10 py-3 text-xs"
                        >
                          <span>{product.name}</span>
                          <span className="whitespace-nowrap rounded-full bg-white/70 px-3 py-1.5 text-[10px]">
                            {product.stock} left
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}