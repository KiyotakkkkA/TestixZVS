import { Modal } from '../../atoms';
import { TestFromAIFillForm, TestFromJsonFillForm } from '../forms';

interface TestAutoCreateModalProps {
  open: boolean;
  onClose: () => void;
  testId: string;
  fillBy?: 'json' | 'ai';
  onCompleted?: () => void;
}

export const TestAutoCreateModal = ({
  open,
  onClose,
  testId,
  fillBy = 'json',
  onCompleted,
}: TestAutoCreateModalProps) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <h3 className="text-lg font-semibold text-slate-800">
          {fillBy === 'ai' ? 'Заполнить с помощью ИИ' : 'Импорт вопросов'}
        </h3>
      }
      outsideClickClosing
    >
      <div className="space-y-4">
        {fillBy === 'json' ? (
          <TestFromJsonFillForm
            testId={testId}
            onSuccess={() => {
              onCompleted?.();
              onClose();
            }}
          />
        ) : null}
        {fillBy === 'ai' ? (
          <TestFromAIFillForm
            testId={testId}
            onSuccess={() => {
              onCompleted?.();
              onClose();
            }}
          />
        ) : null}
      </div>
    </Modal>
  );
};
