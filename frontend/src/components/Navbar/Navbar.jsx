import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import logo from "../../assets/mttlogo.png";
import { Link } from "react-router-dom";
import Button from "../Button/Button";
import './Navbar.css'

const Navbar = () => {
  const { token, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <Link to="/">
        <img src={logo} alt="" className="nav-logo"/>
      </Link>

      {token ? (
        <>
          <Link to="/workouts" className="navigation">Workouts</Link>
          <Link to="/profile" className="navigation">Profile</Link>
          <Link to="/">
            <Button handleClick={logout} variant="logout">Logout</Button>
          </Link>
        </>
      ) : (
        <>
          <Link to="/login" className="navigation">Login</Link>
          <Link to="/users/register" className="navigation">Register</Link>
        </>
      )}
    </nav>
  );
}

export default Navbar;