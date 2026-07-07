import { Injectable } from '@angular/core';
import { loadStripe, Stripe, StripeElements, StripeCardElement, StripeCardNumberElement } from '@stripe/stripe-js';
import { environment } from '@/environments/environment';

@Injectable({ providedIn: 'root' })
export class StripeService {
    private stripe: Stripe | null = null;
    private elements: StripeElements | null = null;
    private card: StripeCardElement | null = null;
    private cardNumber: StripeCardNumberElement | null = null;

    async init() {
        this.stripe = await loadStripe(environment.stripe.publishableKey);
    }


    mountCardElement(
        element: HTMLElement,
        handlers?: { onFocus?: () => void; onBlur?: () => void; onChange?: (event: any) => void }
    ) {
        if (!this.stripe) throw new Error('Stripe no inicializado');
        this.elements = this.stripe.elements();
        this.card = this.elements.create('card', {
            style: {
                base: {
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    color: 'inherit',
                    '::placeholder': { color: '#9ca3af' },
                },
                invalid: { color: '#ef4444' },
            },
        });
        this.card.mount(element);

        if (handlers?.onFocus) this.card.on('focus', handlers.onFocus);
        if (handlers?.onBlur) this.card.on('blur', handlers.onBlur);
        if (handlers?.onChange) this.card.on('change', handlers.onChange);
    }

    mountSplitCardElements(
        numberEl: HTMLElement,
        expiryEl: HTMLElement,
        cvcEl: HTMLElement,
        handlers?: { onChange?: (event: any) => void }
    ) {
        if (!this.stripe) throw new Error('Stripe no inicializado');
        this.elements = this.stripe.elements();

        const style = {
            base: { fontSize: '14px', fontFamily: 'inherit', color: 'inherit', '::placeholder': { color: '#9ca3af' } },
            invalid: { color: '#ef4444' },
        };

        this.cardNumber = this.elements.create('cardNumber', { style });
        const cardExpiry = this.elements.create('cardExpiry', { style });
        const cardCvc = this.elements.create('cardCvc', { style });

        this.cardNumber.mount(numberEl);
        cardExpiry.mount(expiryEl);
        cardCvc.mount(cvcEl);

        if (handlers?.onChange) {
            this.cardNumber.on('change', handlers.onChange);
            cardExpiry.on('change', handlers.onChange);
            cardCvc.on('change', handlers.onChange);
        }
    }

    async createPaymentMethod(): Promise<string> {
        if (!this.stripe || !this.cardNumber) throw new Error('Stripe no inicializado');
        const { paymentMethod, error } = await this.stripe.createPaymentMethod({
            type: 'card',
            card: this.cardNumber,
        });
        if (error) throw new Error(error.message);
        return paymentMethod!.id;
    }


}