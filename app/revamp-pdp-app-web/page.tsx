"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { groceryProducts } from "./products";
import "./style.scss";
import Image from "next/image";
import voucherIcon from "../../assets/icons/ic-voucher.png";

const formatPrice = (price: number) => `Rp ${price.toLocaleString("id-ID")}`;

export default function RevampPdpAppWebPage() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [expandProgress, setExpandProgress] = useState<number[]>([]);
  const [isClosing, setIsClosing] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);
  const touchStartY = useRef<number | null>(null);

  const scrollToProduct = (index: number, smooth = true) => {
    const viewport = viewportRef.current;
    const slide = slideRefs.current[index];
    if (!viewport || !slide) return;

    const left = slide.offsetLeft - (viewport.clientWidth - slide.clientWidth) / 2;
    viewport.scrollTo({ left, behavior: smooth ? "smooth" : "auto" });
  };

  const openProduct = (index: number) => {
    setActiveIndex(index);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => scrollToProduct(index, false));
    });
  };

  const closeProduct = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    window.setTimeout(() => {
      setActiveIndex(null);
      setExpandProgress([]);
      setIsClosing(false);
    }, 320);
  }, [isClosing]);

  const goTo = (index: number) => {
    const nextIndex = Math.max(0, Math.min(groceryProducts.length - 1, index));
    setActiveIndex(nextIndex);
    scrollToProduct(nextIndex);
  };

  useEffect(() => {
    const updateViewportSize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateViewportSize();
    window.addEventListener("resize", updateViewportSize);
    return () => window.removeEventListener("resize", updateViewportSize);
  }, []);

  const updateExpandProgress = (index: number, scrollTop: number) => {
    const progress = Math.max(0, Math.min(1, scrollTop / 140));
    setExpandProgress((current) => {
      if (current[index] === progress) return current;
      const next = [...current];
      next[index] = progress;
      return next;
    });
    if (progress > 0.9 && index === activeIndex) {
      requestAnimationFrame(() => scrollToProduct(index, false));
    }
  };

  useEffect(() => {
    if (activeIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeProduct();
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [activeIndex, closeProduct]);

  const updateActiveProduct = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const viewportCenter = viewport.scrollLeft + viewport.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;
    slideRefs.current.forEach((slide, index) => {
      if (!slide) return;
      const distance = Math.abs(viewportCenter - (slide.offsetLeft + slide.clientWidth / 2));
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    if (closestIndex !== activeIndex) setActiveIndex(closestIndex);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-8">
      <div className="mx-auto w-full max-w-lg">
        <header className="mb-5">
          <Link href="/" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500">
            <span aria-hidden="true">←</span> Back to index
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900">List Product</h1>
          <p className="mt-1 text-sm text-slate-500">Pilih produk untuk lihat detail</p>
        </header>

        <ul className="grid grid-cols-2 gap-2">
          {groceryProducts.map((product, index) => (
            <li key={product.id} className="min-w-0">
              <div
                onClick={() => openProduct(index)}
                className="group block w-full overflow-hidden rounded-xl border border-slate-200 bg-white text-left"
              >
                <div className="aspect-square overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                </div>
                <div className="p-2">
                  <p className="line-clamp-2 min-h-10 leading-5">{product.name}</p>
                  <p className="mt-1 font-black">{formatPrice(product.price)}</p>
                </div>
                <div className="px-2 pb-2 flex items-center gap-1 text-xs font-semibold text-slate-700">
                  <img src="https://alfagift.id/_nuxt/img/Ic-sla-instant.4a352f5.svg" />
                  <span>Pengiriman Instan</span>
                </div>
                <div className="p-1">
                  <button type="button" className="btn primary-outline sm w-full">+ Keranjang</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {activeIndex !== null && (
        <div
          className={`${isClosing ? "modal-backdrop-closing" : "modal-backdrop"} fixed inset-0 z-50 flex backdrop-blur-[2px]`}
          role="dialog"
          aria-modal="true"
          aria-label="Product details"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeProduct();
          }}
          onTouchStart={(event) => {
            if ((expandProgress[activeIndex ?? 0] ?? 0) === 0) {
              touchStartY.current = event.touches[0]?.clientY ?? null;
            }
          }}
          onTouchEnd={(event) => {
            if ((expandProgress[activeIndex ?? 0] ?? 0) !== 0 || touchStartY.current === null) return;
            const distance = (event.changedTouches[0]?.clientY ?? touchStartY.current) - touchStartY.current;
            touchStartY.current = null;
            if (distance > 60) closeProduct();
          }}
        >
          <div
            ref={viewportRef}
            onScroll={updateActiveProduct}
            style={{
              paddingInline: 20 * (1 - ((expandProgress[activeIndex ?? 0] ?? 0))),
            }}
            className={`flex h-full w-full snap-x snap-mandatory items-center gap-2 overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
              activeIndex !== null && (expandProgress[activeIndex] ?? 0) > 0.9
                ? "overflow-x-hidden"
                : "overflow-x-auto"
            }`}
          >
            {groceryProducts.map((product, index) => (
              <section
                key={product.id}
                ref={(element) => { slideRefs.current[index] = element; }}
                onScroll={(event) => updateExpandProgress(index, event.currentTarget.scrollTop)}
                style={viewportSize.width ? (() => {
                  const progress = expandProgress[index] ?? 0;
                  const defaultWidth = Math.min(viewportSize.width - 40, 576);
                  const width = defaultWidth + (viewportSize.width - defaultWidth) * progress;
                  const defaultHeight = viewportSize.height - 64;
                  const height = defaultHeight + (viewportSize.height - defaultHeight) * progress;
                  return {
                    width,
                    height,
                    borderRadius: 16 * (1 - progress),
                  };
                })() : undefined}
                className={`${isClosing ? "modal-zoom-out" : "modal-zoom-in"} shrink-0 snap-center overflow-y-auto rounded-3xl bg-white shadow-2xl`}
              >
                <div
                  className="sticky top-0 z-30 flex h-14 items-center gap-3 px-4"
                  style={{
                    backgroundColor: `rgba(255, 255, 255, ${expandProgress[index] ?? 0})`,
                    backdropFilter: (expandProgress[index] ?? 0) > 0 ? "blur(8px)" : "none",
                  }}
                >
                  <button type="button" onClick={closeProduct} aria-label="Close product details" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-stone-900/75 text-white">
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-5">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  <span
                    className="truncate text-xl font-black"
                    style={{ opacity: expandProgress[index] ?? 0 }}
                    aria-hidden={(expandProgress[index] ?? 0) === 0}
                  >
                    {product.name}
                  </span>
                  <button type="button" aria-label="Share product" className="ml-auto flex size-10 shrink-0 items-center justify-center rounded-full bg-stone-900/75 text-white">
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
                      <path d="M12 16V4" />
                      <path d="m8 8 4-4 4 4" />
                      <path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
                    </svg>
                  </button>
                </div>

                <article className="bg-neutral-100">
                  <div className="mt-[-56px] overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-4 bg-white mb-2">
                    <div className="flex items-center gap-1 text-xs font-semibold">
                      <img src="https://alfagift.id/_nuxt/img/Ic-sla-instant.4a352f5.svg" />
                      <span>Pengiriman Instan</span>
                    </div>
                    <p className="text-xl font-black">{formatPrice(product.price)}</p>
                    <div className="flex gap-3">
                      <p>{product.name}</p>
                      <div className="text-2xl text-neutral-300">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
                          <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <div className="text-xs p-1 bg-neutral-100 rounded-md border border-neutral-200">Sabun Cuci Piring</div>
                      <div className="text-xs p-1 bg-neutral-100 rounded-md border border-neutral-200">Jeruk Nipis</div>
                      <div className="text-xs p-1 bg-neutral-100 rounded-md border border-neutral-200">650g</div>
                    </div>
                  </div>
                  <div className="py-4 bg-white mb-2">
                    <div className="flex items-center justify-between gap-2 mb-1 px-4">
                      <p className="font-black text-base">Lebih hemat pakai voucher</p>
                      <span className="font-black text-xs text-sky-700">Lihat Semua</span>
                    </div>
                    <div className="pt-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      <ul className="flex gap-2 px-4 mr-4">
                        <li>
                          <div className="flex items-center gap-2 voucher-list">
                            <div className="flex items-center gap-1">
                              <Image
                                src={voucherIcon}
                                alt="Voucher"
                                width={16}
                                height={16}
                              />
                              <div>
                                <p className="font-black text-xs voucher-title">Diskon Rp5.000</p>
                                <span className="text-neutral-500 text-xs">Min. beli 6 pcs</span>
                              </div>
                            </div>
                            <span className="text-xs font-black text-red-700">Detail</span>
                          </div>
                        </li>
                        <li>
                          <div className="flex items-center gap-2 voucher-list">
                            <div className="flex items-center gap-1">
                              <Image
                                src={voucherIcon}
                                alt="Voucher"
                                width={16}
                                height={16}
                              />
                              <div>
                                <p className="font-black text-xs voucher-title">Gratis Polytex Sabut Spons Pencuci Piring Regular</p>
                                <span className="text-neutral-500 text-xs">Min. beli 4 pcs</span>
                              </div>
                            </div>
                            <span className="text-xs font-black text-red-700">Detail</span>
                          </div>
                        </li>
                        <li>
                          <div className="flex items-center gap-2 voucher-list">
                            <div className="flex items-center gap-1">
                              <Image
                                src={voucherIcon}
                                alt="Voucher"
                                width={16}
                                height={16}
                              />
                              <div>
                                <p className="font-black text-xs voucher-title">Diskon Rp1.000</p>
                                <span className="text-neutral-500 text-xs">Min. beli 2 pcs</span>
                              </div>
                            </div>
                            <span className="text-xs font-black text-red-700">Detail</span>
                          </div>
                        </li>
                        <li>&nbsp;</li>
                      </ul>
                    </div>
                  </div>
                  <div className="p-4 bg-white mb-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <img className="inline-block h-12 w-12 rounded-full ring-1 ring-neutral-200" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuM7i7KDmhHywDWZB2Alkw9BbbrPFEVY1Veto32JdFIh2zRLo8Yse9izM&s=10" alt="" />
                        <div>
                          <p className="font-black mb-1">Wings</p>
                          <div className="flex items-center gap-1 text-xs font-black text-sky-700">
                            <span>Kunjungi Toko</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-3">
                              <path fill-rule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clip-rule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <button type="button" className="btn primary-outline sm" style={{ paddingLeft: '24px', paddingRight: '24px' }}>Ikuti</button>
                    </div>
                  </div>
                  <div className="p-3 bg-white mb-2">
                    <p>{product.description}</p>
                    <p>Storage: Keep in a cool, dry place and follow the storage guidance on the packaging. Product availability and presentation may vary.</p>
                    <p>Select this item for convenient everyday use at home. The quality is checked for freshness and suitability, then packed securely so it arrives ready for your kitchen, pantry, breakfast table, or meal preparation routine.</p>
                  </div>
                </article>

                <div className="sticky bottom-0 flex items-center justify-between border-t border-slate-100 bg-white px-4 py-4">
                  <button type="button" className="btn primary-outline w-full">+ Keranjang</button>
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
