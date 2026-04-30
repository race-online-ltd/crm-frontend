import { useSocial } from '../context/SocialContext';
import { entities } from '../data/mockData';

const entityColors = {
  'Race Online Ltd.': [136, 182, 68],
  'Earth Telecom':    [214, 56, 5],
  'Dhaka COLO':       [82, 179, 201],
  'Orbit Internet':   [152, 193, 86],
  'Creative BD':      [40, 106, 145],
  'Ocloud':           [27, 104, 227],
};

const entityLogos = {
  'Race Online Ltd.': './brands/race.png',
  'Earth Telecom':    './brands/earth.png',
  'Dhaka COLO':       './brands/dc.png',
  'Orbit Internet':   './brands/orbit.png',
  'Creative BD':      './brands/creative.png',
  'Ocloud':           './brands/ocloud.png',
};

const EntityTabs = () => {
  const { activeEntity, setActiveEntity } = useSocial();

  return (
    <div className="entity-tabs">
      {entities.map((entity) => {
        const isActive = activeEntity === entity;
        const [r, g, b] = entityColors[entity] || [128, 128, 128];

        return (
          <button
            key={entity}
            onClick={() => { setActiveEntity(entity); }}
            title={entity}
            className={`entity-tab${isActive ? ' entity-tab--active' : ''}`}
            style={isActive ? {
              background: `linear-gradient(135deg, rgba(${r},${g},${b},0.85) 0%, rgb(${r},${g},${b}) 100%)`,
              borderColor: 'transparent',
              boxShadow: `0 4px 12px rgba(${r},${g},${b},0.3)`,
              color: '#fff',
            } : {}}
          >
            <img
              src={entityLogos[entity]}
              alt={entity}
              className="entity-tab__logo"
            />
            <span className="entity-tab__label">{entity}</span>
          </button>
        );
      })}
    </div>
  );
};

export default EntityTabs;
