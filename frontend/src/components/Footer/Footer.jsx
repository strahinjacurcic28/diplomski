import logo from "../../assets/mttlogo.png";
import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">


        <div className="footer-section">
          <a href="/">
            <img src={logo} alt="" className="nav-logo"/>
          </a>
          <h3>MTT Fitness</h3>
          <p>Your journey. Your strength. Your transformation.</p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/workouts">Workouts</a></li>
            <li><a href="/profile">Profile</a></li>
            <li><a href="/login">Login</a></li>
          </ul>
        </div>

      </div>
    </footer>
  );
}


export default Footer;