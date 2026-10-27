import { ChangeEvent, FC, FormEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Chip, TextField } from '@mui/material';
import { AttachFileRounded, Close, SendRounded } from '@mui/icons-material';

import {
  assignmentErrorMessage,
  useSubmitAssignment,
  type Assignment,
} from '../../../hooks/useAssignments';
import { snackActions } from '../../../assets/utils/toaster';
import AttachmentList from './attachment-list.component';
import { formatDateTime } from '../homework.utils';

interface StudentSubmissionProps {
  assignment: Assignment;
}

/**
 * The student's answer: the current submission (if any) above a form with
 * a multiline text answer and a file picker. Submitting again replaces
 * the previous submission while the assignment is not yet reviewed.
 */
const StudentSubmission: FC<StudentSubmissionProps> = ({ assignment }) => {
  const { t, i18n } = useTranslation();
  const submit = useSubmitAssignment();
  const existing = assignment.submission;

  const [body, setBody] = useState(existing?.body ?? '');
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    if (picked.length) setFiles((prev) => [...prev, ...picked]);
    event.target.value = '';
  };

  const removeFile = (index: number) =>
    setFiles((prev) => prev.filter((_, i) => i !== index));

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!body.trim() && files.length === 0) {
      setError(t('HOMEWORK.SUBMISSION.EMPTY'));
      return;
    }

    try {
      await submit.mutateAsync({
        slug: assignment.slug,
        body: body.trim(),
        files,
      });
      setFiles([]);
      snackActions.success(t('HOMEWORK.SUBMISSION.SUCCESS'));
    } catch (err) {
      setError(assignmentErrorMessage(err, t('HOMEWORK.SUBMISSION.ERROR')));
    }
  };

  return (
    <section className="hw-section">
      <h2 className="hw-section__title">{t('HOMEWORK.SUBMISSION.TITLE')}</h2>

      {existing && (
        <div className="hw-submission">
          <p className="hw-submission__meta">
            {t('HOMEWORK.SUBMISSION.SUBMITTED_AT', {
              date: formatDateTime(existing.submitted_at, i18n.language),
            })}
          </p>
          {existing.body && (
            <p className="hw-prose" dir="auto">
              {existing.body}
            </p>
          )}
          <AttachmentList files={existing.files} />
          <p className="hw-muted">{t('HOMEWORK.SUBMISSION.REPLACE_HINT')}</p>
        </div>
      )}

      <form className="hw-form" onSubmit={onSubmit} noValidate>
        <TextField
          multiline
          minRows={4}
          fullWidth
          label={t('HOMEWORK.SUBMISSION.BODY')}
          placeholder={t('HOMEWORK.SUBMISSION.BODY_PLACEHOLDER')}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          inputProps={{ maxLength: 10000, dir: 'auto' }}
        />

        <div className="hw-form__files">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={addFiles}
          />
          {files.map((file, index) => (
            <Chip
              key={`${file.name}-${index}`}
              label={file.name}
              size="small"
              onDelete={() => removeFile(index)}
              deleteIcon={<Close aria-label={t('HOMEWORK.FORM.REMOVE_FILE')} />}
            />
          ))}
          <Button
            size="small"
            variant="outlined"
            startIcon={<AttachFileRounded />}
            onClick={() => fileInputRef.current?.click()}
          >
            {t('HOMEWORK.SUBMISSION.FILES')}
          </Button>
        </div>

        {error && <Alert severity="error">{error}</Alert>}

        <div className="hw-form__actions">
          <Button
            type="submit"
            variant="contained"
            startIcon={<SendRounded />}
            disabled={submit.isPending}
          >
            {existing
              ? t('HOMEWORK.SUBMISSION.UPDATE')
              : t('HOMEWORK.SUBMISSION.SUBMIT')}
          </Button>
        </div>
      </form>
    </section>
  );
};

export default StudentSubmission;
