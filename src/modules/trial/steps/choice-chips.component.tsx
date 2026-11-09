import { FC } from 'react';

export interface Choice {
  id: number | string;
  label: string;
  icon?: JSX.Element;
  hint?: string;
  disabled?: boolean;
}

interface ChoiceChipsProps {
  label?: string;
  choices: Choice[];
  value?: number | string;
  onPick: (id: Choice['id']) => void;
  /** "tiles" draws larger cards with an icon and a hint (time of day) */
  variant?: 'chips' | 'tiles';
}

/** A labelled group of pill buttons, one of which is selected */
const ChoiceChips: FC<ChoiceChipsProps> = ({
  label,
  choices,
  value,
  onPick,
  variant = 'chips',
}) => (
  <div className="trial-choice">
    {label && <p className="trial-choice__label">{label}</p>}
    <div className={`trial-choice__list trial-choice__list--${variant}`}>
      {choices.map((choice) => {
        const selected = choice.id === value;
        return (
          <button
            key={choice.id}
            type="button"
            className={`trial-choice__item ${selected ? 'is-selected' : ''}`}
            aria-pressed={selected}
            disabled={choice.disabled}
            onClick={() => onPick(choice.id)}
          >
            {choice.icon && (
              <span className="trial-choice__icon">{choice.icon}</span>
            )}
            <span className="trial-choice__text">
              <span className="trial-choice__name">{choice.label}</span>
              {choice.hint && (
                <span className="trial-choice__hint">{choice.hint}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

export default ChoiceChips;
