import { UssdDialogState, SmsReceiptState } from '../types';

export interface UssdResponse {
  type: 'dialog' | 'message';
  dialogState?: UssdDialogState;
  smsReceipt?: SmsReceiptState;
}

export function parseAndExecuteUssd(
  rawCode: string,
  sim: 'Vodafone' | 'Orange EG'
): UssdResponse {
  const code = rawCode.trim();

  // 1. Direct Vodafone Cash Transfer code: *9*7*PHONE*AMOUNT#
  // e.g. *9*7*01095612011*500#
  const vfCashTransferMatch = code.match(/^\*9\*7\*([0-9]+)\*([0-9]+)#$/);
  if (vfCashTransferMatch) {
    const targetPhone = vfCashTransferMatch[1];
    const amount = Number(vfCashTransferMatch[2]);
    return {
      type: 'dialog',
      dialogState: {
        isOpen: true,
        title: 'Phone',
        message: `تحويل ${amount} ج بالاضافة لـ 1 ج رسوم لرقم\n${targetPhone}\n0 مزيد`,
        inputPrompt: true,
        inputValue: '',
        step: 1,
        targetPhone,
        amount,
        sim,
        sessionData: { type: 'vf_cash_transfer', targetPhone, amount },
      },
    };
  }

  // 2. Vodafone Cash Main Menu: *9#
  if (code === '*9#' || code === '*9*#') {
    return {
      type: 'dialog',
      dialogState: {
        isOpen: true,
        title: 'Phone',
        message: `فودافون كاش:\n1. تحويل أموال\n2. شحن رصيد وفواتير\n3. سحب من ATM\n4. كارت الدفع أونلاين\n5. استعلام عن رصيد المحفظة\n0. المزيد`,
        inputPrompt: true,
        inputValue: '',
        step: 1,
        sim,
        sessionData: { type: 'vf_cash_menu' },
      },
    };
  }

  // 3. Vodafone Balance: *868*1# or *868#
  if (code.startsWith('*868')) {
    return {
      type: 'dialog',
      dialogState: {
        isOpen: true,
        title: 'Phone',
        message: `Vodafone Info:\nرصيدك الحالي هو 42.50 جنيه مصري.\nرصيد باقة فليكس: متبقي 1,420 فليكس تنتهي في 25/11.\nلتجديد الباقة اطلب *225#`,
        inputPrompt: false,
        sim,
      },
    };
  }

  // 4. Orange Cash: *115#
  if (code === '*115#' || code.startsWith('*115')) {
    return {
      type: 'dialog',
      dialogState: {
        isOpen: true,
        title: 'Phone',
        message: `Orange Cash مصر:\n1. تحويل نقدي\n2. شحن رصيد أورنج\n3. دفع فواتير ومرافق\n4. سحب نقدي ATM\n5. كارت الشراء أونلاين\n0. خروج`,
        inputPrompt: true,
        inputValue: '',
        step: 1,
        sim,
        sessionData: { type: 'orange_cash_menu' },
      },
    };
  }

  // 5. Orange Balance: *100# or *100*1#
  if (code.startsWith('*100')) {
    return {
      type: 'dialog',
      dialogState: {
        isOpen: true,
        title: 'Phone',
        message: `Orange Info:\nرصيدك الأساسي 35.00 جنيه مصري.\nمتبقي من باقة GO نت: 3,200 ميجابايت.\nصالح حتى نهاية دورة الفاتورة.`,
        inputPrompt: false,
        sim,
      },
    };
  }

  // 6. Generic or other USSD code:
  return {
    type: 'dialog',
    dialogState: {
      isOpen: true,
      title: 'Phone',
      message: `تم تنفيذ الرمز ${code} بنجاح عبر شبكة ${sim}.\nالخدمة تعمل بشكل طبيعي، شكراً لاستخدامك شبكتنا.`,
      inputPrompt: false,
      sim,
    },
  };
}

export function handleUssdNextStep(
  currentState: UssdDialogState,
  userInput: string
): { dialogState?: UssdDialogState; smsReceipt?: SmsReceiptState } {
  const session = currentState.sessionData || {};

  // Case 1: Vodafone Cash PIN entered after direct transfer code (*9*7*phone*amount#)
  if (session.type === 'vf_cash_transfer') {
    const phone = session.targetPhone || '01095612011';
    const amount = session.amount || 500;
    // Produces the exact SMS shown in video at 01:17:
    return {
      smsReceipt: {
        isOpen: true,
        sender: 'VF-Cash',
        body: `تم تحويل ${amount} جنيه لرقم ${phone}\nمصاريف الخدمة 1 جنيه`,
        url: 'http://vf.eg/vfcash',
        timestamp: Date.now(),
      },
    };
  }

  // Case 2: Vodafone Cash Menu flow
  if (session.type === 'vf_cash_menu') {
    if (userInput === '1') {
      // Transfer money
      return {
        dialogState: {
          ...currentState,
          message: 'فودافون كاش - تحويل أموال:\nأدخل رقم هاتف المستلم (11 رقم):',
          inputPrompt: true,
          inputValue: '',
          step: 2,
          sessionData: { type: 'vf_menu_transfer_phone' },
        },
      };
    }
    if (userInput === '5') {
      // Check wallet balance
      return {
        dialogState: {
          ...currentState,
          message: 'أدخل الرقم السري للمحفظة المكون من 6 أرقام لمعرفة الرصيد:',
          inputPrompt: true,
          inputValue: '',
          step: 2,
          sessionData: { type: 'vf_menu_check_balance' },
        },
      };
    }
    return {
      dialogState: {
        ...currentState,
        message: 'أدخل الرقم السري لتأكيد طلبك أو أعد المحاولة.',
        inputPrompt: true,
        inputValue: '',
        step: 2,
        sessionData: { type: 'vf_cash_transfer', targetPhone: '01095612011', amount: 100 },
      },
    };
  }

  if (session.type === 'vf_menu_transfer_phone') {
    return {
      dialogState: {
        ...currentState,
        message: `تم اختيار الرقم: ${userInput}\nأدخل المبلغ المراد تحويله (من 5 إلى 30,000 ج):`,
        inputPrompt: true,
        inputValue: '',
        step: 3,
        sessionData: { type: 'vf_cash_transfer', targetPhone: userInput, amount: 200 },
      },
    };
  }

  if (session.type === 'vf_menu_check_balance') {
    return {
      smsReceipt: {
        isOpen: true,
        sender: 'VF-Cash',
        body: 'رصيد محفظة فودافون كاش الحالي: 1,850.00 جنيه مصري.\nآخر معاملة: تحويل 500 جنيه.',
        url: 'http://vf.eg/vfcash',
        timestamp: Date.now(),
      },
    };
  }

  // Default reply
  return {
    smsReceipt: {
      isOpen: true,
      sender: currentState.sim === 'Vodafone' ? 'VF-Cash' : 'Orange Cash',
      body: `تم استلام طلبك بنجاح وتنفيذه على الرقم.`,
      timestamp: Date.now(),
    },
  };
}
