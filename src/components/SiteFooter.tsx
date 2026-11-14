import { Link } from "react-router-dom";

function Brand() {
  return <Link className="brand" style={{ display: "inline-flex", alignItems: "center", gap: 9 }} to="/">
    <img width={34} height={34} src="/images/goshopper-bag.svg" alt="" />
    <span style={{ color: "var(--white)" }}>Go<span style={{ color: "var(--orange)" }}>-</span>Shopper</span>
  </Link>;
}

export default function SiteFooter() {
  return <footer>
    <Brand />
    <p>Helping local supermarkets reach more customers, with delivery that works.</p>
    <div>
      <Link to="/register/supermarket">Supermarket registration</Link>
      <Link to="/register/rider">Rider registration</Link>
      <Link to="/sign-in">Sign in</Link>
    </div>
    <small>© {new Date().getFullYear()} Go-Shopper</small>
  </footer>;
}
