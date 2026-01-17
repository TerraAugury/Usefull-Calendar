import * as Dialog from '@radix-ui/react-dialog'
import { IconClose } from './Icons'

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  destructive = false,
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="sheet-content">
          <div className="dialog-header">
            <Dialog.Title className="dialog-title">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <button className="icon-button" type="button" aria-label="Close dialog">
                <IconClose className="tab-icon" />
              </button>
            </Dialog.Close>
          </div>
          {description ? <p>{description}</p> : null}
          <div className="button-row">
            <button
              className={`btn ${destructive ? 'btn-destructive' : 'btn-primary'}`}
              type="button"
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
            <Dialog.Close asChild>
              <button className="btn btn-secondary" type="button">
                Cancel
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
