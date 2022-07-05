export default {
  header: {
    blocks: [
      {
        text: 'GDAILY FRESH SDN.BHD.',
        style: {
          position: 'absolute',
          left: '0px',
          top: '0px',
          right: '0px',
          textAlign: 'center',
          fontSize: '26px',
          fontWeight: 'bold',
        },
      },
      {
        text: '(1219631-A)',
        style: {
          position: 'absolute',
          left: '',
          top: '12px',
          right: '140px',
          bottom: '',
          fontSize: '12px',
        },
      },
      {
        text:
          'LOT 17504,KAWASAN PERINDUSTRIAN SELAYANG,68100 BATU CAVES,SELANGOR.',
        style: {
          position: 'absolute',
          left: '0px',
          top: '30px',
          bottom: '',
          right: '0px',
          fontSize: '14px',
          textAlign: 'center',
        },
      },
      {
        text: 'Phone: 03-6127 9887  Fax:03-6128 3387',
        style: {
          position: 'absolute',
          left: '0px',
          top: '50px',
          bottom: '',
          right: '0px',
          fontSize: '14px',
          textAlign: 'center',
        },
      },
      {
        text: 'Email: accounts@gdailyfresh.com',
        style: {
          position: 'absolute',
          left: '0px',
          top: '70px',
          bottom: '',
          right: '0px',
          textAlign: 'center',
          fontSize: '14px',
        },
      },
      {
        type: 'line',
        style: {
          position: 'absolute',
          left: '0px',
          top: '95px',
          borderTopColor: 'black',
          borderTopWidth: '2px',
          borderTopStyle: 'solid',
          right: '0px',
        },
      },
      {
        text: 'Bill to:',
        style: {
          position: 'absolute',
          left: '10px',
          top: '110px',
          fontWeight: 'bold',
          bottom: '',
          right: '',
          fontSize: '16px',
        },
      },
      {
        text: 'Delivery Address',
        style: {
          position: 'absolute',
          left: '40%',
          top: '110px',
          bottom: '',
          right: '',
          fontWeight: 'bold',
          fontSize: '16px',
        },
      },
      {
        text: 'INVOICE',
        style: {
          position: 'absolute',
          left: '75%',
          top: '105px',
          bottom: '',
          right: '',
          fontWeight: 'bold',
          fontSize: '20px',
        },
      },
      {
        text: '${data.bill_receiver}',
        style: {
          position: 'absolute',
          left: '10px',
          top: '135px',
          fontSize: '12px',
        },
      },
      {
        text: '${data.bill_address}',
        style: {
          position: 'absolute',
          left: '10px',
          top: '150px',
          fontSize: '12px',
          width: '250px',
        },
      },
      {
        text: 'Attn : ${data.address_route_name}',
        style: {
          position: 'absolute',
          left: '10px',
          top: '210px',
          fontSize: '12px',
        },
      },
      {
        text: 'TEL : ${data.receiver_phone}',
        style: {
          position: 'absolute',
          left: '10px',
          top: '225px',
          fontSize: '12px',
        },
      },
      {
        text: '${data.receiver_name}',
        style: {
          position: 'absolute',
          left: '40%',
          top: '135px',
          fontSize: '12px',
        },
      },
      {
        text: '${data.address}',
        style: {
          position: 'absolute',
          left: '40%',
          top: '150px',
          fontSize: '12px',
          width: '250px',
        },
      },
      // 第三列, invoice
      {
        text: 'Invoice No',
        style: {
          position: 'absolute',
          left: '75%',
          top: '135px',
          fontSize: '13px',
        },
      },
      {
        text: ': ${data.tax_number}',
        style: {
          position: 'absolute',
          left: '85%',
          top: '135px',
          fontSize: '13px',
          fontWeight: 'bold',
        },
      },
      {
        text: 'Your Ref.',
        style: {
          position: 'absolute',
          left: '75%',
          top: '155px',
          fontSize: '13px',
        },
      },
      {
        text: ': ${data.your_ref}',
        style: {
          position: 'absolute',
          left: '85%',
          top: '155px',
          fontSize: '13px',
        },
      },
      {
        text: 'Area',
        style: {
          position: 'absolute',
          left: '75%',
          top: '175px',
          fontSize: '13px',
        },
      },
      {
        text: ': ${data.address_route_name}',
        style: {
          position: 'absolute',
          left: '85%',
          top: '175px',
          fontSize: '13px',
        },
      },
      {
        text: 'Our D/O No',
        style: {
          position: 'absolute',
          left: '75%',
          top: '195px',
          fontSize: '13px',
        },
      },
      {
        text: ': ',
        style: {
          position: 'absolute',
          left: '85%',
          top: '195px',
          fontSize: '13px',
        },
      },
      {
        text: 'Terms',
        style: {
          position: 'absolute',
          left: '75%',
          top: '215px',
          fontSize: '13px',
        },
      },
      {
        text: ': ${data.terms}',
        style: {
          position: 'absolute',
          left: '85%',
          top: '215px',
          fontSize: '13px',
        },
      },
      {
        text: 'Date',
        style: {
          position: 'absolute',
          left: '75%',
          top: '235px',
          fontSize: '13px',
        },
      },
      {
        text: ': ${data.receive_time}',
        style: {
          position: 'absolute',
          left: '85%',
          top: '235px',
          fontSize: '13px',
        },
      },
      {
        text: 'Page',
        style: {
          position: 'absolute',
          left: '75%',
          top: '255px',
        },
      },
      {
        text: ': ${pagination.pageIndex} of ${pagination.count}',
        style: {
          position: 'absolute',
          left: '85%',
          top: '255px',
        },
      },
    ],
    style: {
      height: '270px',
    },
  },
  bottom: {
    blocks: [
      {
        type: 'line',
        style: {
          borderTopColor: 'black',
          borderTopStyle: 'solid',
          borderTopWidth: '3px',
          left: '0px',
          position: 'absolute',
          top: '0px',
          width: '100%',
        },
      },
      {
        text: 'RINGGIT MALAYSIA : NINETY FOUR AND CENTS SEVENTY ONLY',
        style: {
          position: 'absolute',
          left: '10px',
          top: '5px',
        },
      },
      {
        text: 'Notes:',
        style: {
          position: 'absolute',
          left: '10px',
          top: '30px',
          fontSize: '12px',
        },
      },
      {
        text: '1. All Cheques should be crossed and make payable to',
        style: {
          position: 'absolute',
          left: '10px',
          top: '50px',
          fontSize: '12px',
        },
      },
      {
        text: 'GDAILY FRESH SDN. BHD.\u00a0\u00a0\u00a0(OCBC : 709-120054-4)',
        style: {
          position: 'absolute',
          left: '18px',
          top: '65px',
          fontSize: '12px',
        },
      },
      {
        text: '2. Received the above listed item in good order and condition.',
        style: {
          position: 'absolute',
          left: '10px',
          top: '80px',
          fontSize: '12px',
        },
      },
      {
        text:
          '3. Any claims on merchandise delivered must be lodged at the time of receipt.',
        style: {
          position: 'absolute',
          left: '10px',
          top: '95px',
          fontSize: '12px',
        },
      },
      {
        text:
          '4. Account not paid within terms are subject to a 1.5% monthly finance charge.',
        style: {
          position: 'absolute',
          left: '10px',
          top: '110px',
          fontSize: '12px',
        },
      },
      {
        text: 'For GDAILY FRESH SDN. BHD.',
        style: {
          position: 'absolute',
          left: '10px',
          top: '130px',
          fontWeight: 'bold',
        },
      },
      {
        type: 'line',
        style: {
          position: 'absolute',
          left: '10px',
          top: '220px',
          borderTopColor: 'black',
          borderTopWidth: '2px',
          borderTopStyle: 'solid',
          width: '200px',
        },
      },
      {
        text: 'Authorised Signature',
        style: {
          position: 'absolute',
          left: '40px',
          top: '225px',
          fontWeight: 'bold',
          fontSize: '14px',
        },
      },
      {
        text: 'Total(RM)',
        style: {
          position: 'absolute',
          right: '180px',
          top: '5px',
          fontWeight: 'bold',
          fontSize: '14px',
        },
      },
      {
        text: '${data.real_price}',
        style: {
          position: 'absolute',
          right: '50px',
          top: '5px',
          fontWeight: 'bold',
          fontSize: '14px',
          width: '120px',
          textAlign: 'right',
        },
      },
      {
        type: 'line',
        style: {
          position: 'absolute',
          right: '50px',
          top: '20px',
          borderTopColor: 'black',
          borderTopWidth: '2px',
          borderTopStyle: 'solid',
          width: '120px',
        },
      },
      {
        text: 'For Customer',
        style: {
          position: 'absolute',
          right: '190px',
          top: '130px',
          fontWeight: 'bold',
          fontSize: '14px',
          textAlign: 'right',
        },
      },
      {
        type: 'line',
        style: {
          position: 'absolute',
          right: '80px',
          top: '220px',
          borderTopColor: 'black',
          borderTopWidth: '2px',
          borderTopStyle: 'solid',
          width: '200px',
        },
      },
      {
        text: 'Customer chop & sign',
        style: {
          position: 'absolute',
          right: '105px',
          top: '225px',
          fontWeight: 'bold',
          fontSize: '14px',
        },
      },
    ],
    style: {
      height: '250px',
    },
  },
}
