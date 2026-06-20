import { useNavigate } from '../lib/router';

const Navbar = () => {
    const navigate = useNavigate();
    return (
        <nav className="navbar">
            <button onClick={() => navigate('/')} className="cursor-pointer">
                <p className="text-2xl font-bold text-gradient">RESUMIND</p>
            </button>
            <button onClick={() => navigate('/upload')} className="primary-button w-fit">
                Upload Resume
            </button>
        </nav>
    );
};
export default Navbar;
