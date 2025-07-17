export interface Translation {
  [key: string]: string;
}

export const translations: { [language: string]: Translation } = {
  en: {
    // Header
    'system_online': 'System Online',
    'smart_beverage_kiosk': 'Smart Beverage Kiosk',
    
    // Drink Selection
    'select_drinks': 'Select Your Drinks',
    'premium_beer': 'Premium Beer',
    'fresh_draft_beer': 'Fresh draft beer',
    'house_wine': 'House Wine',
    'red_white_varieties': 'Red & White varieties',
    'fresh_soda': 'Fresh Soda',
    'cola_sprite_orange': 'Cola, Sprite, Orange',
    'fresh_juice': 'Fresh Juice',
    'orange_apple_cranberry': 'Orange, Apple, Cranberry',
    'all_ages': 'All ages',
    
    // Cart
    'your_order': 'Your Order',
    'cart_empty': 'Your cart is empty',
    'total': 'Total',
    'checkout': 'Checkout',
    
    // Age Verification
    'age_verification_required': 'Age Verification Required',
    'must_be_21': 'You must be 21 or older to purchase alcoholic beverages',
    'consent_required': 'Consent Required',
    'consent_message': 'Do you consent to age verification to complete your purchase?',
    'yes_consent': 'Yes, I Consent',
    'no_cancel': 'No, Cancel',
    'choose_verification': 'Choose Verification Method',
    'face_scan': 'Face Scan Verification',
    'face_scan_desc': 'Look at camera for age estimation',
    'id_card': 'ID Card Verification',
    'id_card_desc': 'Insert valid ID document',
    'face_verification': 'Face Verification',
    'look_at_camera': 'Please look directly at the camera. AI will estimate your age.',
    'simulate_success': 'Simulate Success',
    'back': 'Back',
    
    // Payment
    'payment': 'Payment',
    'choose_payment': 'Choose your payment method',
    'card_payment': 'Card Payment',
    'cash_payment': 'Cash Payment',
    
    // Dispensing
    'dispensing_order': 'Dispensing Your Order',
    'collect_drink': 'Please collect your drink from the dispenser',
    
    // System Messages
    'order_completed': 'Order completed! Thank you for your purchase.',
    'insufficient_stock': 'Insufficient stock available',
    'system_error': 'System error occurred. Please try again.',
    'verification_failed': 'Age verification failed. Please try again.',
    'payment_failed': 'Payment failed. Please try again.',
  },
  
  sk: {
    // Header
    'system_online': 'Systém Online',
    'smart_beverage_kiosk': 'Inteligentný Nápojový Automat',
    
    // Drink Selection
    'select_drinks': 'Vyberte Si Nápoje',
    'premium_beer': 'Prémiové Pivo',
    'fresh_draft_beer': 'Čerstvé točené pivo',
    'house_wine': 'Domáce Víno',
    'red_white_varieties': 'Červené a biele odrody',
    'fresh_soda': 'Čerstvá Sóda',
    'cola_sprite_orange': 'Kola, Sprite, Pomaranč',
    'fresh_juice': 'Čerstvý Džús',
    'orange_apple_cranberry': 'Pomaranč, Jablko, Brusnica',
    'all_ages': 'Všetky vekové kategórie',
    
    // Cart
    'your_order': 'Vaša Objednávka',
    'cart_empty': 'Váš košík je prázdny',
    'total': 'Celkom',
    'checkout': 'Objednať',
    
    // Age Verification
    'age_verification_required': 'Vyžaduje Sa Overenie Veku',
    'must_be_21': 'Musíte mať 21 alebo viac rokov na kúpu alkoholických nápojov',
    'consent_required': 'Vyžaduje Sa Súhlas',
    'consent_message': 'Súhlasíte s overením veku na dokončenie objednávky?',
    'yes_consent': 'Áno, Súhlasím',
    'no_cancel': 'Nie, Zrušiť',
    'choose_verification': 'Vyberte Spôsob Overenia',
    'face_scan': 'Overenie Skenovaním Tváre',
    'face_scan_desc': 'Pozrite sa do kamery na odhad veku',
    'id_card': 'Overenie Občianskym Preukazom',
    'id_card_desc': 'Vložte platný doklad totožnosti',
    'face_verification': 'Overenie Tváre',
    'look_at_camera': 'Prosím pozrite sa priamo do kamery. AI odhadne váš vek.',
    'simulate_success': 'Simulovať Úspech',
    'back': 'Späť',
    
    // Payment
    'payment': 'Platba',
    'choose_payment': 'Vyberte spôsob platby',
    'card_payment': 'Platba Kartou',
    'cash_payment': 'Platba Hotovosťou',
    
    // Dispensing
    'dispensing_order': 'Čapovanie Vašej Objednávky',
    'collect_drink': 'Prosím, vezmite si nápoj z výdajníka',
    
    // System Messages
    'order_completed': 'Objednávka dokončená! Ďakujeme za vašu kúpu.',
    'insufficient_stock': 'Nedostatok zásob',
    'system_error': 'Systémová chyba. Prosím skúste znovu.',
    'verification_failed': 'Overenie veku zlyhalo. Prosím skúste znovu.',
    'payment_failed': 'Platba zlyhala. Prosím skúste znovu.',
  }
};
