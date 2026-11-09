import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { AssignmentSubmission } from '../../../hooks/useAssignments';
import AttachmentList from './attachment-list.component';
import { formatDateTime } from '../homework.utils';

interface SubmissionViewProps {
  submission: AssignmentSubmission;
  /** Shown under the files, e.g. the "submitting again replaces" hint */
  footnote?: string;
}

/**
 * What the student handed in: when, the text and the files. The same block
 * serves the student's own page and the tutor's review page.
 */
const SubmissionView: FC<SubmissionViewProps> = ({ submission, footnote }) => {
  const { t, i18n } = useTranslation();
  return (
    <div className="hw-submission">
      <p className="hw-submission__meta">
        {t('HOMEWORK.SUBMISSION.SUBMITTED_AT', {
          date: formatDateTime(submission.submitted_at, i18n.language),
        })}
      </p>
      {submission.body && (
        <p className="hw-prose" dir="auto">
          {submission.body}
        </p>
      )}
      <AttachmentList files={submission.files} />
      {footnote && <p className="hw-muted">{footnote}</p>}
    </div>
  );
};

export default SubmissionView;
