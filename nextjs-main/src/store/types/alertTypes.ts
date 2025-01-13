export interface AlertState {
    message: string
    open: boolean
    severity: 'error' | 'success'
}