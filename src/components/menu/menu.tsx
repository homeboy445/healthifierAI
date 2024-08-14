import { slide as MenuStore } from 'react-burger-menu';
import "./menu.css";
import { Link } from 'react-router-dom';
import { removeAuthTokens } from '../../utils/Auth';

const Menu = () => {
    return (
      <div className="menu-wrapper">
        <h2>Healthifier</h2>
        <div className='menu-main'>
          <h2 className="menu-item">
            <Link to="/">Home</Link>
          </h2>
          <h2 className="menu-item">
            <Link to="/medicine">Medicine</Link>
          </h2>
          <h2 className="menu-item">
            <Link to="/plans">Plans</Link>
          </h2>
        </div>
          <h3 className="menu-item" onClick={() => {
            removeAuthTokens();
            window.location.href = "/";
          }}>
            logout
          </h3>
      </div>
      );
}

export default Menu;
