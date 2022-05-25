interface IProps {
	header: string;
	onClose: () => void;
	children: JSX.Element | JSX.Element[];
}

const Modal = (props: IProps) => {
	return (
		<div className="modal bg-overlay">
			<div className="box">
				<div className="header">
					<h2>{props.header}</h2>
					<img src="/close.svg" className="close" onClick={props.onClose} />
				</div>
				<div className="body">{props.children}</div>
			</div>
		</div>
	);
};

export default Modal;
