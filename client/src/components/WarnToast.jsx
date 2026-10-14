import { toast } from 'react-hot-toast'
import { AlertTriangle, X } from 'lucide-react'

export function WarnToast({ t, message }) {
	return (
		<div
			className={`flex items-start gap-3 w-full max-w-sm p-4
        bg-amber-50 border border-amber-300 rounded-xl shadow-lg
        transition-all duration-300 ${t?.visible !== false ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
		>
			<AlertTriangle className='text-amber-600 shrink-0 mt-0.5' size={22} />

			<div className='flex-1'>
				<h3 className='text-sm font-semibold text-amber-900'>Warning</h3>
				<p className='text-sm text-amber-800 mt-1'>{message}</p>
			</div>

			<button
				onClick={() => {
					if (t?.id) toast.dismiss(t?.id)
				}}
				className='text-amber-700 hover:text-amber-950'
				aria-label='Dismiss warning'
			>
				<X size={18} />
			</button>
		</div>
	)
}

export const warnToast = (message) => toast.custom((t) => <WarnToast t={t} message={message} />)
