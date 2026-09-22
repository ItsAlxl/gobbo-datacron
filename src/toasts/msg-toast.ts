import { Toast, type ToastDetails } from "./base-toast"

type MessageDetails = ToastDetails & { msg: string }
export class MessageToast extends Toast<MessageDetails> {
	applyBase() {
		this.style = "btn-primary"
	}

	applyDetails(details: MessageDetails) {
		this.inner = details.msg
	}
}