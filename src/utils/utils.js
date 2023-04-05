const amountFormatter = (currency) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: currency || 'NGN',
});

module.exports = {
  amountFormatter,
};
