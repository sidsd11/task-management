import { Loader } from 'lucide-react'

const LoadingAnimation = () => {
	return (
		<div className='flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-blue-200 to-purple-400'>
			<h1 className='text-3xl text-center font-semibold text-black mb-5'>Loading your page...</h1>
			<Loader className='animate-spin' />
		</div>
	)
}

export default LoadingAnimation
