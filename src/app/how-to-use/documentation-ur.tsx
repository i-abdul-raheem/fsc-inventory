import Link from "next/link";

import { PERMISSION_UI_GROUPS } from "@/lib/domain/permissions";

const h2 = "mt-14 scroll-mt-24 text-lg font-semibold tracking-tight text-slate-900 first:mt-0 sm:text-xl";
const h3 = "mt-8 text-base font-semibold text-slate-900";
const p = "mt-3 text-sm leading-relaxed text-slate-700";
const ul = "mt-3 list-disc space-y-2 ps-5 text-sm leading-relaxed text-slate-700";

const accessItems = PERMISSION_UI_GROUPS.flatMap((g) => g.items);

export function HowToUseDocumentationUr() {
  return (
    <article className="text-slate-900">
      <p className="mb-6 font-sans text-sm" dir="ltr">
        <span className="text-slate-600">Language:</span>{" "}
        <Link href="/how-to-use" className="font-medium text-teal-800 underline decoration-teal-800/30 underline-offset-2 hover:text-teal-950">
          English
        </Link>
      </p>

      <header className="border-b border-slate-200 pb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-800">صارف رہنمائی</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">IMS استعمال کرنے کا طریقہ</h1>
        <p className={p}>
          IMS آپ کو سعودی عرب کے لیے انوینٹری اور سیلز کا نظام چلانے میں مدد دیتا ہے: کسٹمر آرڈرز، اسٹاک، کمی کی خریداری،
          رسیدیں، پروڈکٹ لسٹ، اور سادہ مالی رپورٹس۔ یہ رہنمائی بتاتی ہے کہ ایپ کے ہر حصے کا مقصد کیا ہے۔ آپ اسے سائن
          اِن کیے بغیر بھی پڑھ سکتے ہیں۔
        </p>
      </header>

      <nav aria-label="صفحے کا فہرست" className="mt-10 rounded-xl border border-slate-200 bg-slate-50/80 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">اس صفحے پر</p>
        <ol className="mt-3 list-decimal space-y-1.5 ps-5 text-sm text-teal-900">
          <li>
            <a className="underline decoration-teal-800/30 hover:text-teal-950" href="#overview">
              IMS کیا کرتا ہے
            </a>
          </li>
          <li>
            <a className="underline decoration-teal-800/30 hover:text-teal-950" href="#signin">
              سائن اِن اور سائن آؤٹ
            </a>
          </li>
          <li>
            <a className="underline decoration-teal-800/30 hover:text-teal-950" href="#access">
              کون سے حصے کون دیکھ سکتا ہے
            </a>
          </li>
          <li>
            <a className="underline decoration-teal-800/30 hover:text-teal-950" href="#areas">
              ایپ کے اہم حصے
            </a>
          </li>
          <li>
            <a className="underline decoration-teal-800/30 hover:text-teal-950" href="#orders">
              آرڈرز کے ساتھ کام کرنا
            </a>
          </li>
          <li>
            <a className="underline decoration-teal-800/30 hover:text-teal-950" href="#catalog">
              کیٹلاگ، پارٹس، اور کٹس
            </a>
          </li>
          <li>
            <a className="underline decoration-teal-800/30 hover:text-teal-950" href="#procurement">
              خریداری اور وصولی
            </a>
          </li>
          <li>
            <a className="underline decoration-teal-800/30 hover:text-teal-950" href="#trading">
              کسٹمرز اور سیلرز
            </a>
          </li>
          <li>
            <a className="underline decoration-teal-800/30 hover:text-teal-950" href="#reports">
              رپورٹس اور رقم
            </a>
          </li>
          <li>
            <a className="underline decoration-teal-800/30 hover:text-teal-950" href="#help">
              اگر کوئی چیز غائب ہو یا بلاک ہو
            </a>
          </li>
        </ol>
      </nav>

      <h2 id="overview" className={h2}>
        IMS کیا کرتا ہے
      </h2>
      <p className={p}>
        IMS کو اپنی روزمرہ ورک اسپیس سمجھیں: آپ کیا بیچتے ہیں، آپ کے پاس اسٹاک میں کیا موجود ہے، آپ کو ابھی کیا
        خریدنا ہے، اور آرڈرز کو کوٹیشن سے شپمنٹ تک کیسے آگے بڑھانا ہے۔ آرڈرز اور رپورٹس میں رقم سعودی ریال میں استعمال
        ہوتی ہے؛ چھوٹی رقمیں اکثر ہلالہ میں دکھائی جاتی ہیں۔ 100 ہلالہ 1 ریال کے برابر ہوتے ہیں، بالکل سینٹ کی طرح۔
        جہاں اسکرین پر لکھا ہو، وہاں آپریشنز کی تاریخ اور وقت سعودی عرب، یعنی ریاض کے وقت کے مطابق ہوتے ہیں۔
      </p>
      <ul className={ul}>
        <li>پارٹس / کمپوننٹس وہ الگ الگ آئٹمز ہیں جو آپ خریدتے ہیں اور گودام میں گنتے ہیں۔</li>
        <li>
          کٹس وہ پروڈکٹس ہیں جو آپ بیچتے ہیں اور جو پارٹس کی ایک فہرست، یعنی Bill of Materials، سے بنتی ہیں۔ جب آپ
          کسی آرڈر کے لیے اسٹاک چیک کرتے ہیں تو سسٹم حساب لگاتا ہے کہ ہر پارٹ کی کتنی مقدار چاہیے۔
        </li>
        <li>
          آرڈرز آپ کے کسٹمر جابز یا پرچیز آرڈرز ہوتے ہیں، جو مرحلہ وار آگے بڑھتے ہیں یہاں تک کہ وہ شپ ہو جائیں، یا
          منسوخ کر دیے جائیں۔
        </li>
      </ul>

      <h2 id="signin" className={h2}>
        سائن اِن اور سائن آؤٹ
      </h2>
      <ul className={ul}>
        <li>
          سائن اِن صفحہ کھولیں، وہ ای میل اور پاس ورڈ درج کریں جو آپ کے ایڈمنسٹریٹر نے آپ کو دیا ہے، پھر جاری رکھیں۔
        </li>
        <li>سائن اِن کے بعد عام طور پر آپ Dashboard پر پہنچتے ہیں۔</li>
        <li>
          ایپ سے نکلنے کے لیے اوپر بار میں Account menu، یعنی شخص کے آئیکن، کو کھولیں اور Sign out منتخب کریں۔
        </li>
        <li>یہ How to use صفحہ سائن اِن کے بغیر بھی دستیاب رہتا ہے، تاکہ آپ اسے نئے ساتھیوں کے ساتھ شیئر کر سکیں۔</li>
      </ul>

      <h2 id="access" className={h2}>
        کون سے حصے کون دیکھ سکتا ہے
      </h2>
      <p className={p}>
        Administrators سب کچھ استعمال کر سکتے ہیں، بشمول نئے صارفین بنانا اور یہ طے کرنا کہ ہر شخص کیا کر سکتا ہے۔
        Operators صرف وہی menu items اور buttons دیکھتے ہیں جو ان کے administrator نے ان کے لیے آن کیے ہوں۔ اگر آپ
        کوئی ایسا حصہ کھولتے ہیں جس کی آپ کو اجازت نہیں، تو آپ کو مختصر سا access denied پیغام نظر آ سکتا ہے۔ یہ معمول
        کی بات ہے؛ اگر آپ کو مزید رسائی چاہیے تو اپنے administrator سے رابطہ کریں۔
      </p>
      <p className={p}>
        ذیل میں ان تمام صلاحیتوں کی فہرست ہے جو administrator کسی صارف کو دے سکتا ہے۔ آپ کو صرف وہی چیزیں نظر آئیں گی
        جو آپ کے لیے فعال ہوں؛ اس پوری فہرست کو یاد رکھنا ضروری نہیں۔
      </p>
      <ul className="mt-4 list-disc space-y-2 ps-5 font-sans text-sm leading-relaxed text-slate-700">
        {accessItems.map((item) => (
          <li key={item.code}>{item.label}</li>
        ))}
      </ul>

      <h2 id="areas" className={h2}>
        ایپ کے اہم حصے
      </h2>
      <p className={p}>
        اوپر موجود menu، یعنی تین لائنوں والے آئیکن، سے آپ مختلف حصوں میں جا سکتے ہیں۔ نام روزمرہ کاموں کے مطابق
        رکھے گئے ہیں۔
      </p>

      <h3 className={`${h3} font-sans`}>Dashboard</h3>
      <p className={p}>
        یہ شروعاتی جگہ ہے جہاں shortcuts، کھلے کاموں کا خلاصہ، اور کبھی کبھار low-stock warnings نظر آتی ہیں۔ آپ کو
        کیا نظر آئے گا، یہ آپ کی permissions پر منحصر ہے۔
      </p>

      <h3 className={`${h3} font-sans`}>Orders</h3>
      <p className={p}>
        یہاں customer orders کی فہرست ہوتی ہے۔ آپ کسی order کو کھول کر اس کی lines، status، اور وہ next steps دیکھ
        سکتے ہیں جن کی آپ کے role کو اجازت ہے، مثلاً stock check کے لیے submit کرنا، سامان آنے کے بعد retry کرنا، pick
        slip بنانا، یا ship کرنا۔ اگر آپ کو permission ہو تو آپ یہاں سے نیا order بھی شروع کر سکتے ہیں۔ نیا order بناتے
        وقت آپ محفوظ شدہ customer منتخب کر سکتے ہیں یا ایک وقتی نام لکھ سکتے ہیں۔
      </p>

      <h3 className={h3}>Customers</h3>
      <p className={p}>
        یہ ان buyers کی directory ہے جنہیں آپ سعودی عرب میں فروخت کرتے ہیں۔ اس میں names، contacts، city، VAT notes،
        اور دیگر معلومات شامل ہو سکتی ہیں۔ order کو customer سے link کرنے سے بعد میں اس buyer کو تلاش کرنا آسان ہو
        جاتا ہے۔
      </p>

      <h3 className={h3}>Sellers</h3>
      <p className={p}>
        یہ ان suppliers کی directory ہے جن سے آپ parts خریدتے ہیں، اکثر بیرون ملک سے۔ یہ reference اور contacts کے لیے
        ہے؛ آنے والا stock پھر بھی Inventory میں record کیا جاتا ہے۔
      </p>

      <h3 className={`${h3} font-sans`}>Procurement</h3>
      <p className={p}>
        یہاں وہ جگہیں دکھائی جاتی ہیں جہاں انتظار میں موجود orders کے لیے parts کم ہیں۔ آپ supplier references نوٹ کر
        سکتے ہیں، اجازت ہونے پر کسی part کی receipt record کر سکتے ہیں، اور سامان آنے کے بعد system سے دوبارہ stock
        allocate کرنے کی کوشش کروا سکتے ہیں۔
      </p>

      <h3 className={`${h3} font-sans`}>Inventory</h3>
      <p className={p}>
        یہاں آپ suppliers سے آنے والا stock receive کرتے ہیں اور stocktake کے بعد تعداد درست کرتے ہیں۔ آپ یہ بھی دیکھ
        سکتے ہیں کہ گودام میں physically کتنا stock موجود ہے اور کتنا پہلے ہی open orders کے لیے promised ہے۔
      </p>

      <h3 className={`${h3} font-sans`}>Catalogue</h3>
      <p className={p}>
        یہ آپ کے parts اور kits کی فہرست ہے۔ یہاں آپ items شامل کرتے ہیں، names اور codes میں ترمیم کرتے ہیں، low-stock
        warnings set کرتے ہیں، reports میں استعمال ہونے والی costs درج کرتے ہیں، اور ہر kit کے لیے parts list بناتے
        ہیں۔
      </p>

      <h3 className={`${h3} font-sans`}>Reports</h3>
      <p className={p}>
        یہ profit، stock value، sales history، اور اسی طرح کے topics کے لیے read-only views ہیں، جو ریال میں دکھائے
        جاتے ہیں۔ ہر report screen بتاتی ہے کہ اس میں کیا شامل ہے۔ مکمل tax filing اور bank feeds اس app کا حصہ
        نہیں ہیں۔
      </p>

      <h3 className={`${h3} font-sans`}>Alerts</h3>
      <p className={p}>
        یہ وہ parts دکھاتا ہے جن کی quantity catalogue میں set کیے گئے low-stock level سے نیچے چلی گئی ہو۔ اگر alerts
        آپ کے لیے on ہوں تو header میں bell icon پر count بھی نظر آ سکتا ہے۔
      </p>

      <h3 className={`${h3} font-sans`}>Account</h3>
      <p className={p}>
        اگر آپ کا administrator اجازت دے تو آپ اپنا display name یا password تبدیل کر سکتے ہیں۔ آپ کا email address صرف
        reference کے لیے دکھایا جاتا ہے۔
      </p>

      <h3 className={`${h3} font-sans`}>
        <span className="block">Users and Access</span>
        <span className="mt-1 block text-sm font-normal text-slate-600">صرف administrators کے لیے</span>
      </h3>
      <p className={p}>
        یہاں operator accounts بنائے یا deactivate کیے جاتے ہیں، اور ہر شخص کے لیے یہ منتخب کیا جاتا ہے کہ وہ کون سے
        حصے استعمال کر سکتا ہے۔ اگر آپ administrator نہیں ہیں تو یہ screens آپ کو نظر نہیں آئیں گی۔
      </p>

      <h2 id="orders" className={h2}>
        آرڈرز کے ساتھ کام کرنا
      </h2>
      <p className={p}>ایک order عام طور پر ان stages سے گزرتا ہے۔ screen پر labels تھوڑے مختلف ہو سکتے ہیں۔</p>
      <ul className={ul}>
        <li>Draft — آپ ابھی lines اور customer کی details میں ترمیم کر رہے ہیں۔</li>
        <li>
          Waiting on parts — system موجودہ stock سے مکمل kit cover نہیں کر سکا؛ Procurement میں دکھایا جاتا ہے کہ کیا
          کمی ہے۔
        </li>
        <li>
          Stock reserved / ready for warehouse — کافی parts دستیاب ہیں؛ warehouse pick instructions پر عمل کر سکتا ہے
          اور پھر confirm کر سکتا ہے کہ goods shelf سے نکال لیے گئے ہیں۔
        </li>
        <li>
          Fulfilled and shipped — pick کی گئی quantities stock سے deduct ہو جاتی ہیں، اور جب shipment record کی جاتی
          ہے تو order مکمل سمجھا جاتا ہے۔
        </li>
        <li>
          Cancelled — order آگے نہیں بڑھے گا؛ اسے صرف اس وقت استعمال کریں جب آپ کے role کو اجازت ہو اور order پہلے ہی
          مکمل نہ ہو چکا ہو۔
        </li>
      </ul>
      <p className={p}>
        ہر order page پر Next steps section استعمال کریں اور وہی action کریں جو اس وقت order کے stage سے match کرتا
        ہو۔ جب نیا stock آئے تو اپنے administrator کے بتائے ہوئے steps استعمال کریں، اکثر order page یا Procurement پر،
        تاکہ waiting orders دوبارہ آگے بڑھ سکیں۔
      </p>

      <h2 id="catalog" className={h2}>
        کیٹلاگ، پارٹس، اور کٹس
      </h2>
      <ul className={ul}>
        <li>
          ہر kit کے لیے parts اور quantities کی واضح فہرست ضروری ہے، تاکہ system sales کے لیے stock صحیح طریقے سے check کر
          سکے۔
        </li>
        <li>Parts پر درج standard costs reports میں اس وقت شامل ہوتی ہیں جب order fulfill اور ship ہو جائے۔</li>
        <li>
          Available stock وہ مقدار ہے جو on-hand stock میں سے دوسرے open orders کے لیے already promised مقدار نکالنے
          کے بعد بچتی ہے۔ اس طرح ایک ہی box دو بار book نہیں ہوتا۔
        </li>
      </ul>

      <h2 id="procurement" className={h2}>
        خریداری اور وصولی
      </h2>
      <ul className={ul}>
        <li>
          Procurement shortages کو part کے حساب سے group کرتا ہے، تاکہ buyers دیکھ سکیں کہ کون سے customers ایک ہی
          component کا انتظار کر رہے ہیں۔
        </li>
        <li>
          جب goods arrive ہوں تو Inventory میں receipt post کریں، یا اگر آپ کے پاس shortcut ہو تو Procurement سے کریں۔
          اس کے بعد system ممکن ہو تو waiting orders کو خودکار طور پر cover کرنے کی دوبارہ کوشش کر سکتا ہے۔
        </li>
        <li>
          آپ اپنی traceability کے لیے procurement lines پر supplier purchase order یا delivery notes رکھ سکتے ہیں۔
        </li>
      </ul>

      <h2 id="trading" className={h2}>
        کسٹمرز اور سیلرز
      </h2>
      <ul className={ul}>
        <li>
          Customers میں ان لوگوں یا کمپنیوں کی details ہوتی ہیں جنہیں آپ sell کرتے ہیں۔ order کو customer سے link کرنے
          سے بعد میں lookup آسان ہو جاتا ہے۔
        </li>
        <li>
          Sellers میں وہ suppliers ہوتے ہیں جن سے آپ buy کرتے ہیں۔ انہیں اپنی normal receiving process کے ساتھ ایک
          contact directory کی طرح استعمال کریں۔
        </li>
      </ul>

      <h2 id="reports" className={h2}>
        رپورٹس اور رقم
      </h2>
      <ul className={ul}>
        <li>Reports orders اور parts پر درج prices اور costs استعمال کر کے ریال میں مکمل تصویر دکھاتی ہیں۔</li>
        <li>
          یہ operational insight کے لیے ہیں، مکمل tax return یا bank reconciliation کے لیے نہیں۔ ہر report پر موجود
          مختصر notes ضرور پڑھیں تاکہ آپ کو اس کی limits معلوم رہیں۔
        </li>
        <li>
          Cash-flow style view فی الحال placeholder ہے، جب تک future version میں real bank data connect نہیں کیا جاتا۔
        </li>
      </ul>

      <h2 id="help" className={h2}>
        اگر کوئی چیز غائب ہو یا بلاک ہو
      </h2>
      <ul className={ul}>
        <li>
          اگر کوئی menu item یا button غائب ہے تو ممکن ہے آپ کے account کو وہ ability نہ دی گئی ہو۔ اپنے administrator سے
          پوچھیں۔
        </li>
        <li>
          اگر کوئی page کہے کہ آپ اسے access نہیں کر سکتے، تو وجہ بھی یہی ہو سکتی ہے۔ آپ کا administrator آپ کی access
          adjust کر سکتا ہے۔
        </li>
        <li>
          Passwords، locked accounts، یا training کے لیے اپنی organisation میں IMS manage کرنے والے شخص سے رابطہ کریں۔
        </li>
      </ul>

      <p className={`${p} mt-12 border-t border-slate-200 pt-8 text-sm text-slate-600`}>
        آپ کا administrator اس app کو آپ کی company کے کام کے طریقے کے مطابق رکھتا ہے۔ جب processes بدلتے ہیں تو وہ یہ
        update کر سکتا ہے کہ کون کیا کر سکتا ہے، تاکہ باقی سب کے لیے menus سادہ رہیں۔
      </p>
    </article>
  );
}
