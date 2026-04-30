import Badge from '@mui/material/Badge';
import { useSocial } from '../context/SocialContext';

const mediums = [
  { key: 'messenger', label: 'Facebook',  icon: '/social/messenger.png', count: 5,  activeColor: '#0084ff' },
  { key: 'whatsapp',  label: 'WhatsApp',  icon: '/social/whatsapp.png',  count: 3,  activeColor: '#25D366' },
  { key: 'email',     label: 'Email',     icon: '/social/mail.png',       count: 12, activeColor: '#0078d4' },
];

const MediumTabs = () => {
  const { activeMedium, setActiveMedium } = useSocial();

  return (
    <>
      <style>{`
        .medium-tabs-row {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 8px 16px 12px;
          width: 100%;
          box-sizing: border-box;
        }

        .medium-tabs-group {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 999px;
          padding: 3px;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
        }

        .medium-tab {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          border-radius: 50px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-size: 18.5px;
          font-weight: 600;
          color: #6b7280;
          transition: all 0.18s ease;
          outline: none;
          white-space: nowrap;
          font-family: inherit;
          line-height: 1;
        }

        .medium-tab:hover:not(.medium-tab--active) {
          background: #e5e7eb;
          color: #374151;
        }

        .medium-tab--active {
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 0 0 0.5px rgba(15,23,42,0.08);
        }

        .medium-tab__icon {
          width: 16px;
          height: 16px;
          object-fit: contain;
          display: block;
          flex-shrink: 0;
        }

        .medium-tab__label {
          display: inline;
        }

        /* Mobile: icon only */
        @media (max-width: 600px) {
          .medium-tab {
            padding: 6px 10px;
            gap: 0;
          }
          .medium-tab__label {
            display: none;
          }
          .medium-tab__icon {
            width: 18px;
            height: 18px;
          }
        }
      `}</style>

      <div className="medium-tabs-row">
        <div className="medium-tabs-group">
          {mediums.map(({ key, label, icon, count, activeColor }) => {
            const isActive = activeMedium === key;

            return (
              <button
                key={key}
                onClick={() => { setActiveMedium(key); }}
                className={`medium-tab${isActive ? ' medium-tab--active' : ''}`}
                style={isActive ? { color: activeColor } : {}}
              >
                <Badge
                  badgeContent={count}
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: 9,
                      height: 14,
                      minWidth: 14,
                      fontWeight: 700,
                      top: 0,
                      right: -1,
                      padding: '0 3px',
                    },
                  }}
                >
                  <img
                    src={icon}
                    alt={label}
                    className="medium-tab__icon"
                  />
                </Badge>
                <span className="medium-tab__label" style={{ marginLeft: 4 }}>{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MediumTabs;
