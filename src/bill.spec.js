const Bill = require('./Bill')
const omit = require('lodash/omit')

describe('bill', () => {
  let billAttrs = {
    type: 'health',
    subtype: 'C GENERALISTE',
    beneficiary: 'RAPHAEL',
    isThirdPartyPayer: true,
    date: '2017-08-21T22:00:00.000Z',
    originalDate: '2017-08-17T22:00:00.000Z',
    vendor: 'Ameli',
    isRefund: true,
    amount: 17.5,
    originalAmount: 25,
    fileurl:
      'https://assure.ameli.fr/PortailAS/PDFServletDetailPaiementPT.dopdf?idPaiement=MTgwMDI1NzQ2MzE1MnxQfDIwMTcwODIyfDExNDA4NzgwOXwxMTQwODc4MDl8Q0VOVFJFIERFIFNBTlRFIERVIENIIEQnQSBVQkVOQVMgICAgICAgIHxUfFV8MTcuNXw=',
    filename: '20170822_ameli.pdf',
    groupAmount: 17.5,
    metadata: { version: 1 },
    invoice: 'io.cozy.files:c7a76b7eb6c60ccd0c8466047912132a',
    _id: 'c7a76b7eb6c60ccd0c846604791940b1',
    _rev: '3-dca38838252c09fbb6b024e34dcc8b30'
  }
  let bill = new Bill({
    ...billAttrs,
    ...{
      date: new Date(billAttrs.date),
      originalDate: new Date(billAttrs.originalDate)
    }
  })

  it('should update if different', () => {
    // No difference
    expect(bill.shouldUpdate(billAttrs)).toBe(false)
    // Attribute has changed
    expect(
      bill.shouldUpdate({ ...billAttrs, ...{ metadata: { version: 7 } } })
    ).toBe(true)
    // Attribute has been deleted
    expect(bill.shouldUpdate(omit(billAttrs, 'fileurl'))).toBe(true)
  })
})
