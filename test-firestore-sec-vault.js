const crypto = require('crypto-js');
const KNOWN_VAULT_KEYS = [
  'Gxgfhf54x_+&7_gxfhgxg&*&*&¢%fzts"dzrX&*\'zgxf_,6_5*\'"*&*_dzg_*5¢¢°%¢6*_fzfzgxf_"6*&zgzf,gzg',
  'YonoVaultSecret2026MasterKey!',
  'YonoVaultSecret2026MasterKey',
  'rummydex_master_vault_key_2026',
  'rummydex_secure_link_vault_key_2026',
  'rummydex-secure-vault-2025-x891'
];
const ciphertext = "U2FsdGVkX19oR0wZv/SVzsjpNrywFjoGwfla3auChzYnxmlgTSYrfRNz+e9Z/veVYuC0BXnKjgrundsD6/mN/7wJwkO4S1F9+N0MKrxOTJR2MjHY7cH6DtF0H4RJQgko41bSt7YjBDQW95kjT9YEpMdaayqNm/lw/aYkYNRG9erhYWSMtpg8q/1VMQ3X1pyWbFAQu4c4esoJ+1QF8xYqTMKLWszBqiIMyrJ2xLS7i4ILJwEcUWnCIvHqp90d+dkMFb4A4ZoH66R+o1v3fmYIehkwcCKSy6ewBzySZ0RFV/Ypru7VOc6/rVXNRNZxrh3Mw9WW6Qoccy7CN51Zu7ODAqAZJuLpWe9PD8ZbIo4xujnvS3Qo4QwoNVT0qHW+Gy7/KdnCbT/0kz+KJZ0qRPDqDtmQmpx8MWM340XKFcqqol5KYeQHiC07j+6i24G0mT3nZx8V76s7lGnd32QQTgsFeqG3PBXj8zjxkweSA9JBDpeFGangnc/DCLm8Z0rSqM4Vnu3+olpJoC0CwuVB0TOAaUhWbbF8ehnpa36CrMamqaRflOLe780ITe20WewRB8FMoqpBUv5WnSIGoEQWz87y7kq5XASKqiODGR6rjsLhlQyDZQ5uE5tX9vXLmiBdxSiFyVGINEuD8JjI5P3qNbNMn1y8HcL7ut4oZV0zXbhvWJtEOPuG2YMB9A+nevFxUllorrpUYqMhVKKQyTmM7ViYbgs6w5i52xCww3DikVDuSWXj1JjA060sZoWrWvS8wS/8/w6UaqpFz4aMv+7She8klIfIwm/oKQh4S0xr7UVXal7vmE8AqjtSjv5BCY4D90hh8jpg1APfy1k0qLhwuR6WHNlSHRdfBKfc63F9SUANI+S6A0VdgIeGxd8294lfDPNiQquhRNjO0ROLKtPQ0L/0+5tWaxkm7xJsb90CObhiKCfLY9awDxqShqvzjE1WSlUze0DC6pEb5oukcd9CgtU2xatjDgxoS1nWrtbO9Z272Rd3gTAJgZtP2bquRbDBdO0jaUhxqJtDgTb8nuCmxZ5HRtqMejQXWSFmPpWkSUZM4BHTlJVgsCY4+N2FMV98Yrc/axxwUR+dI7Kj92HUhGFkSvNmOJp8dLrtPc94Ez152x2x5utamoinxsN2hhj0SlYhlkWjtn89jE1WVYj5wweOki9D/DCFazVCCJ4Z1nDFrDhJoi5CMBODlXX9IWnxpILjTga54YsdNnZNJmEzH1A2KuKPlKuLEe859R458sVBDe0XWmmcRj1CohLRbOuGiz0m+IY4N3isYJdFqA/JuQdkkGOhvwW4e+uJTFWzpMv1eqy2AJIfKfCaJbOpt1oavddy25XeBZH54Urr/ffikfuebUcgVPNlo7ikt09G9IeTtR38KPqQG4jNLIzAdPBOmzSW3aE2oDWrKnEE1JOnTfHcHWGQMJ7guDRRIIxqpZbSxxpZlaTzuhEBsXVCgsQ7lC//tYqvqgvFoWf16R9mAYvS0KmPXcyeCku99jVmLSKy3YId9sudiUBGPolQlBgicA9qY1X7gsP5QR9rnFgB0sGjZHw08+x5+PdwcYsC6eLsubnOLcWm7Iy5rp8aCNTFF4V+f66LCGs/ZNt20MYsA9OZC2SvEcVfw4G52TwJaVP3KN5KqrUf91y80x6sEw2A10TG";

let decrypted = false;
for (const key of KNOWN_VAULT_KEYS) {
  try {
    const bytes = crypto.AES.decrypt(ciphertext, key);
    const text = bytes.toString(crypto.enc.Utf8);
    if (text) {
      console.log('Decrypted with', key, ':', text);
      decrypted = true;
    }
  } catch(e) {}
}
if (!decrypted) console.log("FAILED TO DECRYPT");
