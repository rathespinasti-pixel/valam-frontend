export function SocialLinks({ className = "footer-social", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={className} style={style}>
      <a href="#" aria-label="Facebook">
        <i className="fa-brands fa-facebook-f" aria-hidden="true" />
      </a>
      <a href="#" aria-label="Instagram">
        <i className="fa-brands fa-instagram" aria-hidden="true" />
      </a>
      <a href="#" aria-label="YouTube">
        <i className="fa-brands fa-youtube" aria-hidden="true" />
      </a>
      <a href="#" aria-label="WhatsApp">
        <i className="fa-brands fa-whatsapp" aria-hidden="true" />
      </a>
    </div>
  );
}
