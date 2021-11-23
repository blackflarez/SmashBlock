const Amount = (amount) => {
  {
    return new Intl.NumberFormat('en-GB', {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(amount)
  }
}

export default Amount
