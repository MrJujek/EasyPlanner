import { Link } from 'react-router-dom';

export const NotFound = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center space-y-8 p-8">
                <div className="relative">
                    <h1 className="text-9xl font-black text-gray-200 select-none">404</h1>
                    <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-gray-800 whitespace-nowrap">
                        Page Not Found
                    </p>
                </div>

                <p className="text-gray-500 max-w-md mx-auto text-lg">
                    Oops! It seems like you've wandered off the path. The page you are looking for doesn't exist or has been moved.
                </p>

                <div>
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white transition-all duration-200 bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                        Go back
                    </Link>
                </div>
            </div>
        </div>
    );
};
