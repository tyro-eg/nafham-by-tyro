import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import { OpenInNewRounded } from '@mui/icons-material';
import { useChannelStateContext } from 'stream-chat-react';

import { sendAssistantTurn } from '../../lib/assistant';
import { snackActions } from '../../assets/utils/toaster';

interface AssistantOptionsProps {
  options: Array<{ id: string; label: string }>;
  links: Array<{ label: string; url: string }>;
  /** Only the assistant's latest message still takes answers */
  latest: boolean;
}

/**
 * The buttons under an assistant message: its links (a payment page, a
 * page of the app) and, on the latest message only, the options to pick.
 * Tapping an option sends its label as the person's message, then tells
 * the assistant which option it was.
 */
const AssistantOptions: FC<AssistantOptionsProps> = ({
  options,
  links,
  latest,
}) => {
  const { t, i18n } = useTranslation();
  const { channel } = useChannelStateContext();
  const [busy, setBusy] = useState<string | null>(null);

  const pick = async (option: { id: string; label: string }) => {
    if (busy) return;
    setBusy(option.id);
    try {
      await channel.sendMessage({ text: option.label });
      await sendAssistantTurn({
        choice: option.id,
        text: option.label,
        locale: i18n.language,
      });
    } catch (err) {
      console.error('The assistant could not take the answer', err);
      snackActions.error(t('MESSAGES.ASSISTANT.UNAVAILABLE'));
    } finally {
      setBusy(null);
    }
  };

  if (links.length === 0 && (!latest || options.length === 0)) return null;

  return (
    <div className="nf-assistant">
      {links.length > 0 && (
        <div className="nf-assistant__links">
          {links.map((link) => (
            <Button
              key={link.url}
              variant="contained"
              color="primary"
              size="small"
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              endIcon={<OpenInNewRounded />}
            >
              {link.label}
            </Button>
          ))}
        </div>
      )}
      {latest && options.length > 0 && (
        <div
          className="nf-assistant__options"
          role="group"
          aria-label={t('MESSAGES.ASSISTANT.OPTIONS')}
        >
          {options.map((option, index) => (
            <Button
              key={option.id}
              variant="outlined"
              color="secondary"
              size="small"
              disabled={busy !== null}
              onClick={() => pick(option)}
              dir="auto"
            >
              <span className="nf-assistant__number" aria-hidden="true">
                {index + 1}
              </span>
              {option.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssistantOptions;
