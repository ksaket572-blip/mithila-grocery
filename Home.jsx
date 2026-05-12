import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import "../styles/Home.css";

const Home = () => {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // SEARCH + CATEGORY
  const [search, setSearch] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState(
      localStorage.getItem(
        "selectedCategory"
      ) || "All"
    );

  // HERO SLIDER
  const [currentSlide, setCurrentSlide] =
    useState(0);

  const navigate = useNavigate();

  // =========================
  // GROCERY HERO DATA
  // =========================

  const heroSlides = [
    {
      badge: "⚡ 10 Minute Delivery",

      title:
        "Fresh Groceries Delivered Fast",

      description:
        "Get fruits, vegetables, dairy products and daily essentials delivered directly to your doorstep.",

      button: "Shop Groceries",

      image:
        "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200",

      bg:
        "linear-gradient(135deg,#1b5e20,#43a047)"
    },

    {
      badge: "🥦 Farm Fresh Vegetables",

      title:
        "Healthy Food For Your Family",

      description:
        "Fresh vegetables, fruits, milk, bread and grocery essentials at the best prices.",

      button: "Explore Fresh Items",

      image:
        "https://images.unsplash.com/photo-1610348725531-843dff563e2c?q=80&w=1200",

      bg:
        "linear-gradient(135deg,#2e7d32,#66bb6a)"
    },

    {
      badge: "🛒 Daily Essentials",

      title:
        "Everything You Need Everyday",

      description:
        "Snacks, beverages, household items and personal care products available instantly.",

      button: "Start Shopping",

      image:
        "https://images.unsplash.com/photo-1573246123716-6b1782bfc499?q=80&w=1200",

      bg:
        "linear-gradient(135deg,#33691e,#8bc34a)"
    }
  ];

  // =========================
  // ADD TO CART
  // =========================

  const addToCart = async (productId) => {

    const user = JSON.parse(
      localStorage.getItem("user")
    );

    if (!user) {

      alert("Login first");
      return;
    }

    const token =
      localStorage.getItem("userToken");

    if (!token) {

      alert("Token missing → login again");

      console.log("TOKEN:", token);

      return;
    }

    try {

      const res = await fetch(
        "http://localhost:5000/api/cart/add",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            productId,
            quantity: 1
          })
        }
      );

      const data = await res.json();

      console.log(
        "ADD CART RESPONSE:",
        data
      );

      if (res.ok) {

        alert("Added to cart");

        window.location.reload();

      } else {

        alert(data.msg || "Cart error");
      }

    } catch (err) {

      console.log("ERROR:", err);

      alert("Something went wrong");
    }
  };

  // =========================
  // BUY NOW
  // =========================

  const buyNow = (product) => {

    localStorage.setItem(
      "buyNowItem",

      JSON.stringify({
        _id: product._id,
        name: product.name
      })
    );

    localStorage.removeItem(
      "cartCheckout"
    );

    navigate("/checkout");
  };

  // =========================
  // FETCH PRODUCTS
  // =========================

  useEffect(() => {

    axios
      .get(
        "http://localhost:5000/api/products"
      )

      .then((res) => {

        setProducts(res.data);

        setLoading(false);
      })

      .catch((err) => {

        console.log(
          "ERROR:",
          err.response?.data ||
          err.message
        );

        setLoading(false);
      });

  }, []);

  // =========================
  // CATEGORY LISTENER
  // =========================

  useEffect(() => {

    const updateCategory = () => {

      const savedCategory =
        localStorage.getItem(
          "selectedCategory"
        ) || "All";

      setSelectedCategory(
        savedCategory
      );
    };

    window.addEventListener(
      "categoryChanged",
      updateCategory
    );

    return () => {

      window.removeEventListener(
        "categoryChanged",
        updateCategory
      );
    };

  }, []);

  // =========================
  // AUTO HERO SLIDER
  // =========================

  useEffect(() => {

    const interval = setInterval(() => {

      setCurrentSlide((prev) =>
        prev === heroSlides.length - 1
          ? 0
          : prev + 1
      );

    }, 4000);

    return () => clearInterval(interval);

  }, []);

  // =========================
  // FILTER PRODUCTS
  // =========================

  const filteredProducts =
    products.filter((item) => {

      const matchesSearch =
        item.name
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesCategory =

        selectedCategory === "All" ||

        item.category
          ?.toLowerCase()
          .includes(
            selectedCategory.toLowerCase()
          );

      return (
        matchesSearch &&
        matchesCategory
      );
    });

  return (

    <>

      <div className="home-container">

        {/* =========================
            GROCERY HERO SECTION
        ========================= */}

        <div className="modern-hero-wrapper">

          {heroSlides.map((slide, index) => (

            <div
              key={index}

              className={
                currentSlide === index
                  ? "modern-hero active"
                  : "modern-hero"
              }

              style={{
                background: slide.bg
              }}
            >

              {/* LEFT */}

              <div className="modern-hero-left">

                <div className="modern-badge">
                  {slide.badge}
                </div>

                <h1 className="modern-title">
                  {slide.title}
                </h1>

                <p className="modern-description">
                  {slide.description}
                </p>

                <button className="modern-btn">
                  {slide.button}
                </button>

              </div>

              {/* RIGHT */}

              <div className="modern-hero-right">

                <img
                  src={slide.image}
                  alt="hero"
                  className="modern-hero-image"
                />

              </div>

            </div>
          ))}

          {/* DOTS */}

          <div className="modern-dots">

            {heroSlides.map((_, index) => (

              <span
                key={index}

                onClick={() =>
                  setCurrentSlide(index)
                }

                className={
                  currentSlide === index
                    ? "modern-dot active-dot"
                    : "modern-dot"
                }
              ></span>

            ))}

          </div>

        </div>

        {/* =========================
            GROCERY PROMO CARDS
        ========================= */}

        <div className="promo-wrapper">

          <div className="promo-card green-card">

            <h2>
              Fresh Fruits & Vegetables
            </h2>

            <p>
              Farm fresh healthy products
              delivered daily.
            </p>

            <button>
              Order Now
            </button>

          </div>

          <div className="promo-card yellow-card">

            <h2>
              Dairy, Bread & Eggs
            </h2>

            <p>
              Milk, butter, bread and daily
              breakfast essentials.
            </p>

            <button>
              Shop Now
            </button>

          </div>

          <div className="promo-card gray-card">

            <h2>
              Snacks & Beverages
            </h2>

            <p>
              Cold drinks, chips, biscuits
              and instant snacks.
            </p>

            <button>
              Explore
            </button>

          </div>

        </div>

        {/* =========================
            LOADING
        ========================= */}

        {loading && (

          <p className="loading-text">
            Loading...
          </p>
        )}

        {/* =========================
            EMPTY
        ========================= */}

        {!loading &&
          filteredProducts.length === 0 && (

            <p className="empty-text">
              No products found ❌
            </p>
          )}

        {/* =========================
            PRODUCT GRID
        ========================= */}

        <div className="product-grid">

          {filteredProducts.map((item) => (

            <div
              key={item._id}
              className="product-card"
            >

              <img
                src={`http://localhost:5000/uploads/${item.image}`}
                alt={item.name}
                className="product-image"
              />

              <h3 className="product-name">
                {item.name}
              </h3>

              <p className="product-category">
                {item.category}
              </p>

              <p className="product-price">
                ₹{item.price}
              </p>

              <div className="product-buttons">

                <button
                  className="cart-btn"

                  onClick={() =>
                    addToCart(item._id)
                  }
                >
                  Add to Cart
                </button>

                <button
                  className="buy-btn"

                  onClick={() =>
                    buyNow(item)
                  }
                >
                  Buy Now
                </button>

              </div>

            </div>
          ))}

        </div>

      </div>

      <Footer />

    </>

  );
};

export default Home;