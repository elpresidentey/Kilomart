import { Link, useParams, Navigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { ArrowLeft } from 'lucide-react'
import { useI18n } from '../i18n/useI18n'
import { repairText } from '../i18n/repairText'

type DocKind = 'terms' | 'privacy' | 'cookies' | 'safety'
type Lang = 'en' | 'ha' | 'yo' | 'ig'

type DocContent = {
  titles: Record<DocKind, string>
  backHome: string
  terms: string[]
  privacy: string[]
  cookies: string[]
  safety: string[]
}

const DOCS: Record<Lang, DocContent> = repairText({
  en: {
    titles: {
      terms: 'Terms of service',
      privacy: 'Privacy policy',
      cookies: 'Cookie policy',
      safety: 'Safety & trust',
    },
    backHome: 'Back to home',
    terms: [
      'By using Farmers Market you agree to use the platform lawfully, provide accurate information, and complete payment obligations for orders you place. Sellers agree to list accurate products, weights, and fulfill orders in good faith.',
      'Farmers Market may update these terms; continued use after changes means acceptance. For disputes, contact support@kilomarket.ng first.',
    ],
    privacy: [
      'We collect account and order data needed to run the marketplace (for example name, contact, and delivery address). We do not sell your personal data.',
      'You may request access or correction of your profile data via support@kilomarket.ng.',
    ],
    cookies: [
      'We use essential cookies and local storage to keep you signed in and remember your cart. Analytics or marketing cookies may be added later, with consent where required.',
      'You can clear site data in your browser settings at any time.',
    ],
    safety: [
      'Meet in safe locations for cash-on-delivery where applicable, verify order details before payment, and report suspicious listings or messages to support@kilomarket.ng.',
    ],
  },
  ha: {
    titles: {
      terms: 'Sharuddan amfani',
      privacy: 'Manufar sirri',
      cookies: 'Manufar kukis',
      safety: 'Tsaro da amincewa',
    },
    backHome: 'Komawa gida',
    terms: [
      'Ta amfani da Farmers Market kana yarda ka yi amfani da dandalin cikin doka, ka bayar da sahihan bayanai, kuma ka cika wajibcin biyan umarni da ka yi. Masu sayarwa su jera kayayyaki da nauyi daidai kuma su cika umarni da gaskiya.',
      'Farmers Market na iya sabunta sharudda; ci gaba da amfani bayan canje-canje na nufin ka amince. Don rikice-rikice, fara tuntubar support@kilomarket.ng.',
    ],
    privacy: [
      'Muna tattara bayanan asusu da oda da ake bukata domin gudanar da kasuwa (misali suna, tuntuÉ“a, da adireshin isarwa). Ba ma sayar da bayananka na sirri.',
      'Kana iya neman damar gani ko gyaran bayanan profayil ta support@kilomarket.ng.',
    ],
    cookies: [
      'Muna amfani da kukis na asali da local storage don ka ci gaba da shiga da kuma tuna katinka. Ana iya kara kukis na nazari ko talla daga baya tare da yarda inda ake bukata.',
      'Kana iya goge bayanan shafi a saitunan browser dinka a kowane lokaci.',
    ],
    safety: [
      'Ku hadu a wurare masu tsaro idan biyan kudi a lokacin isarwa ya shafi oda, ku tabbatar da bayanan oda kafin biya, kuma ku kai rahoton abubuwan da ba su dace ba zuwa support@kilomarket.ng.',
    ],
  },
  yo: {
    titles: {
      terms: 'Awon ofin ise',
      privacy: 'Eto asiri',
      cookies: 'Eto kuki',
      safety: 'Aabo ati igbekele',
    },
    backHome: 'Pada si ile',
    terms: [
      'Nipa lilo Farmers Market, o gba lati lo páº¹páº¹ ni á»na to ba ofin mu, pese alaye to pe, ki o si pari ojuse isanwo fun awon aá¹£áº¹ ti o pa. Awá»n olutaja gbodo fi á»ja to pe han ati pari aá¹£áº¹ ni otito.',
      'Farmers Market le á¹£e imudojuiwá»n awon ofin yii; lilo tesiwaju láº¹hin ayipada tumo si gbigba. Fun ariyanjiyan, kan support@kilomarket.ng ni aká»ká».',
    ],
    privacy: [
      'A n gba data aká»á»láº¹ ati aá¹£áº¹ to nilo lati á¹£iá¹£áº¹ á»ja (fun apáº¹áº¹ráº¹ oruká», ibaraáº¹nisá»rá», ati adiráº¹si ifijiá¹£áº¹). A ko ta data ara áº¹ni ráº¹.',
      'O le beere wiwá»le tabi atunse data profaili ráº¹ nipasáº¹ support@kilomarket.ng.',
    ],
    cookies: [
      'A n lo kuki pataki ati local storage lati jáº¹ ki o wa ni wá»le ati lati ranti kati ráº¹. A le fi kuki itupaláº¹ tabi tita kun nigbamii, pelu igbanilaaye nibiti ofin beere.',
      'O le nu data aaye kuro ninu eto browser ráº¹ nigbakugba.',
    ],
    safety: [
      'Pade ni ibi aabo fun cash-on-delivery nibiti o ba yáº¹, jáº¹risi alaye aá¹£áº¹ á¹£aaju isanwo, ki o si jabo akojá» ifura tabi ifiraná¹£áº¹ si support@kilomarket.ng.',
    ],
  },
  ig: {
    titles: {
      terms: 'Usoro ojiji',
      privacy: 'Amá»¥ma nzuzo',
      cookies: 'Amá»¥ma kuki',
      safety: 'Nchekwa na ntá»¥kwasá»‹ obi',
    },
    backHome: 'Laghachi nâ€™á»¥lá»',
    terms: [
      'Site nâ€™iji Farmers Market, á»‹ kwenyere iji ikpo okwu nâ€™usoro iwu, nye ozi ziri ezi, ma mezue á»¥gwá» maka orders á»‹ tinyere. Ndá»‹ na-ere ga-edepá»¥ta ngwaahá»‹a na ibu ziri ezi ma mezue orders nâ€™ezi okwukwe.',
      'Farmers Market nwere ike imelite usoro ndá»‹ a; iji ya nâ€™ihu mgbe mgbanwe pá»¥tara na á»‹ nabatara. Maka esemokwu, kpá»tá»¥rá»¥ support@kilomarket.ng mbá»¥.',
    ],
    privacy: [
      'Anyá»‹ na-anaká»ta data akaá»¥ntá»¥ na order dá»‹ mkpa iji rá»¥á» ahá»‹a (dá»‹ka aha, ká»ntaktá»‹, na adreesá»‹ nnyefe). Anyá»‹ anaghá»‹ ere data onwe gá»‹.',
      'á»Š nwere ike á»‹rá»‹á» ohere ma á» bá»¥ mmezi data profaá»‹lá»¥ gá»‹ site na support@kilomarket.ng.',
    ],
    cookies: [
      'Anyá»‹ na-eji kuki dá»‹ mkpa na local storage iji mee ka á»‹ ná»gide na banye ma chekwaa kati gá»‹. A pá»¥kwara á»‹gbakwunye kuki nyocha ma á» bá»¥ ahá»‹a nâ€™á»dá»‹nihu, na nkwenye ebe iwu chá»rá» ya.',
      'á»Š nwere ike ihichapá»¥ data saá»‹tá»‹ nâ€™ihe nhazi browser gá»‹ mgbe á» bá»¥la.',
    ],
    safety: [
      'Zute nâ€™ebe nchekwa maka cash-on-delivery ebe o kwesiri, nyochaa nká»wa order tupu á»‹kwá»¥ á»¥gwá», ma ká»á» ndepá»¥ta ma á» bá»¥ ozi na-enyo enyo na support@kilomarket.ng.',
    ],
  },
})

export function LegalDocument() {
  const { kind } = useParams<{ kind: string }>()
  const { language } = useI18n()
  const isDocKind = (k: string): k is DocKind =>
    k === 'terms' || k === 'privacy' || k === 'cookies' || k === 'safety'

  if (!kind || !isDocKind(kind)) {
    return <Navigate to="/" replace />
  }

  const lang = language as Lang
  const content = DOCS[lang] ?? DOCS.en
  const title = content.titles[kind]
  const body =
    kind === 'terms'
      ? content.terms
      : kind === 'privacy'
        ? content.privacy
        : kind === 'cookies'
          ? content.cookies
          : content.safety

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-8 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {content.backHome}
        </Link>

        <article className="prose prose-stone max-w-none">
          <h1 className="text-3xl font-bold text-stone-900 mb-6">{title}</h1>
          <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
            {body.map((p, i) => (
              <p key={`${kind}-${i}`}>{p}</p>
            ))}
            <p>
              <a href="mailto:support@kilomarket.ng" className="text-primary-700 hover:underline">
                support@kilomarket.ng
              </a>
            </p>
          </div>
        </article>
      </div>
    </Layout>
  )
}
