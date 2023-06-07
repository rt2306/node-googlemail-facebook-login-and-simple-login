import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Navbar = ({ user }) => {
    const navigate = useNavigate()
    const logout = () => {
        window.open("http://localhost:5000/auth/logout", "_self");
    };
    let token_has = localStorage.getItem('token') ? localStorage.getItem('token') : '' 
    const ClearData = async () => { 
        let response = await axios.delete("http://192.168.10.52:5000/user/logout",{
            headers:{
                Authorization: `Bearer ${token_has}`
            }
        })  
        if (response === undefined) { 
            return;
        }

        if (response?.data?.status_code == 0) { 
            return;
        }

        if (response?.data?.status_code == 1) {  
            localStorage.clear();
            navigate('/login')
            return;
        }
    };


    return (
        <>


            <div className="navbar">
                <span className="logo">
                    <Link className="link" to="/">
                        Lama App
                    </Link>
                </span>
                {user && token_has.length==0 && (
                    <ul className="list">
                        <li className="listItem">
                            <img
                                src={user.photos[0].value}
                                alt=""
                                className="avatar"
                            />
                        </li>
                        <li className="listItem">{user.displayName}</li>
                        <li className="listItem" onClick={logout}>
                            Logout
                        </li>
                    </ul>
               
                )}

                {token_has.length > 0 && !user && (
                    <ul className="list">
                        <li className="listItem">
                        </li>
                        <li className="listItem" onClick={()=>{ClearData()}}>
                            Logout
                        </li>
                    </ul> 
                )}

                {
                    !user && !token_has &&
                    <Link className="link" to="login">
                        Login
                    </Link>
                }

            </div>

        </>
    );
};

export default Navbar;
