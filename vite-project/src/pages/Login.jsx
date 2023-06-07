import Google from "../img/google.png";
import Facebook from "../img/facebook.png";
import Github from "../img/github.png";
import { useFormik } from "formik";
import * as Yup from 'yup';
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const google = () => {
    window.open("http://localhost:5000/auth/google", "_self");
  };

 const navigate = useNavigate()

  const facebook = () => {
    window.open("http://localhost:5000/auth/facebook", "_self");
  };

  const formik = useFormik({
    initialValues: {
        email: '',
        password: ''
    },
    validationSchema: Yup.object({
        email: Yup.string().required('Email is required').email('Invalid Email Format'),
        password: Yup.string().required('Password is required')
    }),
    onSubmit: async (values) => { 
        let response = await axios.post("http://192.168.10.52:5000/user/login_by_admin", values) 
        console.log(values,"valuesvaluesvalues");
        if (response?.data?.status_code == 0) { 
            return
        }
        if (response?.data?.status_code == 1) {   
            navigate('/')
            localStorage.setItem("token", response.data?.data?.token);
            resetForm();
        }
    }
})

const { values, handleSubmit, handleChange, errors, touched, resetForm } = formik;
  return (
    <div className="login">
     
      <div className="wrapper">
        <div className="left">
          <div className="loginButton google" onClick={google}>
            <img src={Google} alt="" className="icon" />
            Google
          </div>
          <div className="loginButton facebook" onClick={facebook}>
            <img src={Facebook} alt="" className="icon" />
            Facebook
          </div> 
        </div>
        <div className="center">
          <div className="line" />
          <div className="or">OR</div>
        </div>
        <div className="right">
        <div className="auth-form p-3 border-bottom">
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <div className="input-group">
                                                <span className="input-group-text">
                                                    <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 48 48" fill="var(--white)"><path d="M7 40q-1.2 0-2.1-.9Q4 38.2 4 37V10q0-1.2.9-2.1Q5.8 8 7 8h34q1.2 0 2.1.9.9.9.9 2.1v26q0 1.2-.9 2.1-.9.9-2.1.9Zm17-15.1L7 13.75V37h34V13.75Zm0-3L40.8 10H7.25ZM7 13.75V10v26Z" /></svg>
                                                </span>
                                                <input type="text" className="form-control" placeholder="Enter Email" name="email" value={values.email || ''} onChange={handleChange} />
                                            </div>
                                            {errors.email && touched.email && (<span className="text-danger form_err">{errors.email}</span>)}
                                        </div>
                                        <div className="mb-3">
                                            <div className="input-group">
                                                <span className="input-group-text">
                                                    <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 48 48" fill="var(--white)"><path d="M14 27.4q-1.4 0-2.4-1t-1-2.4q0-1.4 1-2.4t2.4-1q1.4 0 2.4 1t1 2.4q0 1.4-1 2.4t-2.4 1Zm0 8.6q-5 0-8.5-3.5T2 24q0-5 3.5-8.5T14 12q3.6 0 6.3 1.7 2.7 1.7 4.25 5.15h17.8L48 24.5l-8.35 7.65-4.4-3.2-4.4 3.2-3.75-3h-2.55q-1.25 3-3.925 4.925Q17.95 36 14 36Zm0-3q2.9 0 5.35-1.925 2.45-1.925 3.15-4.925h5.7l2.7 2.25 4.4-3.15 4.1 3.1 4.25-3.95-2.55-2.55H22.5q-.6-2.8-3-4.825Q17.1 15 14 15q-3.75 0-6.375 2.625T5 24q0 3.75 2.625 6.375T14 33Z" /></svg>
                                                </span>
                                                <input id="login_password" type="password" className="form-control" placeholder="Enter Password" name="password" value={values.password || ''} onChange={handleChange} />
                                                <span className="input-group-text">
                                                </span>
                                            </div>
                                            {errors.password && touched.password && (<span className="text-danger form_err">{errors.password}</span>)}
                                        </div>
                                        <div className="text-center">
                                                <input type="submit" className="btn" value="Login" />
                                        </div>
                                    </form>
                                </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
