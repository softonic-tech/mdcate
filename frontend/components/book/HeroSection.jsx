export default function HeroSection() {
  return (
    <section className="books-hero">
      <div className="books-hero__content">
        <h1>Find Your Perfect Study Books</h1>
        <p>
          Browse KPK, Punjab & Federal textbooks and shortcut notes
          for MDCAT preparation.
        </p>
        <button
          onClick={() => {
            const booksSection = document.querySelector(".book-grid");
            if (booksSection) {
              booksSection.scrollIntoView({ behavior: "smooth" });
            }
          }}
        >
          Browse Collection
        </button>
      </div>

      <div className="books-hero__image">
        <img src="/images/books-hero.jpg" alt="Books Illustration" />
      </div>
    </section>
  );
}